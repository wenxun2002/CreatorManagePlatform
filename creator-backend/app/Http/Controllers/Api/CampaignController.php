<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CampaignController extends Controller
{
    /**
     * List campaigns for the authenticated user.
     * Managers see campaigns they dispatched; creators see campaigns they received.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $query = Campaign::query()->with(['manager:id,name,email,role', 'creator:id,name,email,role']);

        if ($user->isManager()) {
            $query->where('manager_id', $user->id);
        } else {
            $query->where('creator_id', $user->id);
        }

        $campaigns = $query->latest()->get();

        return response()->json([
            'data' => $campaigns,
        ]);
    }

    /**
     * Manager dispatches a campaign to one or more creators (one row per creator).
     */
    public function store(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isManager()) {
            return response()->json([
                'message' => 'Only managers can create campaigns.',
            ], 403);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'budget' => ['required', 'numeric', 'min:0'],
            'due_date' => ['required', 'date'],
            'creator_ids' => ['required', 'array', 'min:1'],
            'creator_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('users', 'id')->where(fn ($q) => $q->where('role', 'creator')),
            ],
            'attachments' => ['nullable', 'array'],
            'attachments.*' => [
                'file',
                'mimes:zip,pdf,mp4,jpg,jpeg,png,gif,webp',
                'max:102400', // 100 MB
            ],
        ]);

        $attachmentPaths = [];

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $attachmentPaths[] = [
                    'path' => $file->store('attachments', 'public'),
                    'name' => $file->getClientOriginalName(),
                ];
            }
        }

        $campaigns = DB::transaction(function () use ($user, $data, $attachmentPaths) {
            $created = [];

            foreach ($data['creator_ids'] as $creatorId) {
                $campaign = Campaign::query()->create([
                    'manager_id' => $user->id,
                    'creator_id' => $creatorId,
                    'title' => $data['title'],
                    'budget' => $data['budget'],
                    'due_date' => $data['due_date'],
                    'status' => 'pending',
                    'attachments' => $attachmentPaths ?: null,
                ]);

                $campaign->load(['manager:id,name,email,role', 'creator:id,name,email,role']);
                $created[] = $campaign;
            }

            return $created;
        });

        return response()->json([
            'message' => 'Campaign(s) created successfully.',
            'data' => $campaigns,
        ], 201);
    }

    /**
     * Transition campaign status. Use POST (multipart) when uploading submission_file.
     */
    public function updateStatus(Request $request, Campaign $campaign): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $isParticipant = $campaign->manager_id === $user->id || $campaign->creator_id === $user->id;

        if (! $isParticipant) {
            return response()->json([
                'message' => 'You are not allowed to update this campaign.',
            ], 403);
        }

        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'in_progress', 'under_review', 'completed'])],
            'submission_desc' => ['nullable', 'string', 'max:5000'],
            'submission_file' => ['nullable', 'file', 'mimes:mp4,mov,webm', 'max:204800'], // 200 MB
            'video_url' => ['nullable', 'url', 'max:2048'],
        ]);

        if ($data['status'] === 'under_review') {
            if ($campaign->creator_id !== $user->id) {
                return response()->json([
                    'message' => 'Only the assigned creator can submit deliverables.',
                ], 403);
            }

            $request->validate([
                'submission_file' => ['required', 'file', 'mimes:mp4,mov,webm', 'max:204800'],
                'submission_desc' => ['required', 'string', 'max:5000'],
            ]);

            $uploaded = $request->file('submission_file');
            $path = $uploaded->store('submissions', 'public');
            $campaign->submission_file = $path;
            $campaign->submission_original_name = $uploaded->getClientOriginalName();
            $campaign->submission_desc = $data['submission_desc'];
        }

        if ($data['status'] === 'completed' && $campaign->manager_id !== $user->id) {
            return response()->json([
                'message' => 'Only the manager can approve this campaign.',
            ], 403);
        }

        if ($data['status'] === 'in_progress' && $campaign->creator_id !== $user->id) {
            return response()->json([
                'message' => 'Only the assigned creator can accept this campaign.',
            ], 403);
        }

        $campaign->status = $data['status'];

        if (array_key_exists('video_url', $data) && $data['video_url'] !== null) {
            $campaign->video_url = $data['video_url'];
        }

        $campaign->save();
        $campaign->load(['manager:id,name,email,role', 'creator:id,name,email,role']);

        return response()->json([
            'message' => 'Campaign status updated.',
            'data' => $campaign,
        ]);
    }
}

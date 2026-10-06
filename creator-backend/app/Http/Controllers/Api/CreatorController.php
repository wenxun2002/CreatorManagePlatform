<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreatorController extends Controller
{
    /**
     * List creators for manager assignment dropdowns.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isManager()) {
            return response()->json([
                'message' => 'Only managers can list creators.',
            ], 403);
        }

        $creators = User::query()
            ->where('role', 'creator')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        return response()->json([
            'data' => $creators,
        ]);
    }
}

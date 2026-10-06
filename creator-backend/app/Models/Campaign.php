<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'manager_id',
        'creator_id',
        'title',
        'budget',
        'due_date',
        'status',
        'video_url',
        'attachments',
        'submission_file',
        'submission_original_name',
        'submission_desc',
    ];

    protected $appends = [
        'attachment_files',
        'submission_file_url',
    ];

    protected function casts(): array
    {
        return [
            'budget' => 'decimal:2',
            'due_date' => 'date',
            'attachments' => 'array',
        ];
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Public URLs + original filenames for manager-uploaded attachments.
     *
     * @return list<array{path: string, name: string, url: string}>
     */
    public function getAttachmentFilesAttribute(): array
    {
        $items = $this->attachments ?? [];

        return collect($items)
            ->map(function ($item) {
                if (is_array($item) && isset($item['path'])) {
                    $path = (string) $item['path'];
                    $name = (string) ($item['name'] ?? basename($path));

                    return [
                        'path' => $path,
                        'name' => $name,
                        'url' => asset('storage/'.$path),
                    ];
                }

                if (is_string($item) && $item !== '') {
                    return [
                        'path' => $item,
                        'name' => basename($item),
                        'url' => asset('storage/'.$item),
                    ];
                }

                return null;
            })
            ->filter()
            ->values()
            ->all();
    }

    public function getSubmissionFileUrlAttribute(): ?string
    {
        if (! $this->submission_file) {
            return null;
        }

        return asset('storage/'.$this->submission_file);
    }
}

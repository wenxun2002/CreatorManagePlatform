<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->json('attachments')->nullable()->after('video_url');
            $table->string('submission_file')->nullable()->after('attachments');
            $table->text('submission_desc')->nullable()->after('submission_file');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('campaigns', function (Blueprint $table) {
            $table->dropColumn(['attachments', 'submission_file', 'submission_desc']);
        });
    }
};

<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\CreatorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/creators', [CreatorController::class, 'index']);

    Route::get('/campaigns', [CampaignController::class, 'index']);
    Route::post('/campaigns', [CampaignController::class, 'store']);
    // POST for multipart file submissions (PHP does not parse files on PATCH reliably)
    Route::post('/campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);
    Route::patch('/campaigns/{campaign}/status', [CampaignController::class, 'updateStatus']);
});

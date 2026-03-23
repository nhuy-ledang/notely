<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class MediaController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480'],
        ]);

        /** @var UploadedFile $file */
        $file = $request->file('file');
        $mime = (string) $file->getMimeType();

        $allowed = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'audio/webm', 'video/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp3',
            'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/x-m4a',
        ];

        $ok = str_starts_with($mime, 'image/') || in_array($mime, $allowed, true);

        if (! $ok) {
            throw ValidationException::withMessages([
                'file' => ['Only images and short audio clips are allowed.'],
            ]);
        }

        $user = $request->user();
        $path = $file->store('media/'.$user->id, 'public');
        $relative = Storage::disk('public')->url($path);

        return response()->json([
            'url' => $relative,
        ], Response::HTTP_CREATED);
    }
}

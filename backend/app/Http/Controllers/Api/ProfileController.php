<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'preferences' => $user->preferences ?? [],
                'created_at' => $user->created_at?->toIso8601String(),
                'updated_at' => $user->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'theme' => ['sometimes', 'string', 'in:light,dark,system'],
            'accent' => ['sometimes', 'nullable', 'string', 'max:64'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $prefs = array_merge($user->preferences ?? [], $validated);
        $user->preferences = $prefs;
        $user->save();

        return response()->json([
            'preferences' => $user->preferences,
        ]);
    }
}

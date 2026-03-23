<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback(): RedirectResponse
    {
        $frontend = rtrim((string) config('app.frontend_url'), '/');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Throwable) {
            return redirect()->away("{$frontend}/auth/callback?error=oauth_failed");
        }

        $email = $googleUser->getEmail();
        if (! is_string($email) || $email === '') {
            return redirect()->away("{$frontend}/auth/callback?error=no_email");
        }

        $googleId = (string) $googleUser->getId();
        $name = $googleUser->getName() ?: (strstr($email, '@', true) ?: 'User');

        $user = User::query()->where('google_id', $googleId)->first();

        if (! $user) {
            $user = User::query()->where('email', $email)->first();
            if ($user) {
                if ($user->google_id !== null && $user->google_id !== $googleId) {
                    return redirect()->away("{$frontend}/auth/callback?error=account_mismatch");
                }
                $user->forceFill(['google_id' => $googleId])->save();
            }
        }

        if (! $user) {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::password(32)),
                'google_id' => $googleId,
                'oauth_only_password' => true,
            ]);
        }

        $token = JWTAuth::fromUser($user);
        $ttlSeconds = (int) config('jwt.ttl') * 60;
        $fragment = http_build_query([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => (string) $ttlSeconds,
        ]);

        return redirect()->away("{$frontend}/auth/callback#{$fragment}");
    }
}

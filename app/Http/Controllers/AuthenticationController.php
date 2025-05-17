<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Closure;
class AuthenticationController extends Controller
{
    public function handle(Request $request, Closure $next)
{
    Log::info('RememberTokenAuth middleware triggered');

    $authHeader = $request->header('Authorization');

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        Log::warning('Token missing or malformed');
        return response()->json(['message' => 'Token missing'], 401);
    }

    $token = substr($authHeader, 7);
    Log::info('Received token', ['token' => $token]);

    $user = User::where('remember_token', $token)->first();

    if (!$user) {
        Log::warning('Invalid token', ['token' => $token]);
        return response()->json(['message' => 'Invalid token'], 401);
    }

    Auth::login($user);

    return $next($request);
}


}

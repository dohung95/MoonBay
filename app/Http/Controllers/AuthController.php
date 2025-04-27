<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|numeric|digits_between:10,15|unique:users,phone',
                'password' => 'required|string|min:6',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
            ]);

            // Token đã được tự động tạo bởi model User (trong boot method)

            return response()->json([
                'message' => 'Registration successful',
                'user' => $user,
                'token' => $user->remember_token,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            Log::info('Login attempt', ['email' => $request->input('email')]);

            // Validate request
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);
            Log::info('Validation passed', $validated);

            // Tìm user
            $user = User::where('email', $validated['email'])->first();
            if (!$user) {
                Log::warning('User not found', ['email' => $validated['email']]);
                return response()->json(['message' => 'Invalid credentials'], 401);
            }
            Log::info('User found', ['user_id' => $user->id]);

            // Kiểm tra password
            if (!Hash::check($validated['password'], $user->password)) {
                Log::warning('Password mismatch', ['email' => $validated['email']]);
                return response()->json(['message' => 'Invalid credentials'], 401);
            }
            Log::info('Password verified');

            // Lấy token từ cột remember_token
            if (!$user->remember_token) {
                // Nếu không có token, tạo mới và lưu lại
                $user->remember_token = \Illuminate\Support\Str::random(60);
                $user->save();
                Log::info('New token generated for user', ['user_id' => $user->id]);
            }

            return response()->json([
                'message' => 'Login successful',
                'user' => $user,
                'name' => $user->name,
                'avatar' => $user->avatar,
                'phone' => $user->phone,
                'id' => $user->id,
                'email' => $user->email,
                'token' => $user->remember_token,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Login Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return response()->json(['message' => 'Login failed: ' . $e->getMessage()], 500);
        }
    }

    public function ForgotPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);

            $status = Password::sendResetLink(
                $request->only('email')
            );

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json(['message' => __($status)], 200);
            }

            return response()->json(['message' => __($status)], 400);
        } catch (\Exception $e) {
            Log::error('Forgot Password Error:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Server error occurred.'], 500);
        }
    }

    public function update(Request $request, $id)
    {

        $user = User::findOrFail($id);
        $user->update($request->all());

        try {
            // Lấy token từ header Authorization
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['message' => 'Token not provided'], 401);
            }

            // Tìm user dựa trên token trong cột remember_token
            $user = User::where('remember_token', $token)->first();
            if (!$user) {
                return response()->json(['message' => 'Invalid token'], 401);
            }

            // Kiểm tra xem user có quyền cập nhật thông tin không
            if ($user->id != $id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $id,
                'phone' => 'nullable|string|max:20',
            ]);

            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user,
            ], 200);
        } catch (\Exception $e) {
            Log::error('Update User Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update user: ' . $e->getMessage()], 500);
        }
    }

}
<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use App\Models\Booking;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;


class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|numeric|digits_between:10,15|unique:users,phone',
                'password' => 'required|string|min:8',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

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
            // Ghi log thông tin yêu cầu đăng nhập
            Log::info('Login attempt', ['email' => $request->input('email')]);

            // Validate request
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);
            Log::info('Validation passed', $validated);

            // Sử dụng Auth::attempt để kiểm tra đăng nhập
            if (!Auth::attempt($validated)) {
                Log::warning('Invalid credentials', ['email' => $validated['email']]);
                return response()->json(['message' => 'Invalid credentials'], 401);
            }

            // Lấy user đã đăng nhập
            $user = Auth::user();
            Log::info('User authenticated', ['user_id' => $user->id]);

            // Tìm user theo email
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

            // Tái tạo session để bảo mật
            $request->session()->regenerate();

            // Tạo token Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // Trả về thông tin user và token
            return response()->json([
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                ],
                'token' => $token,
            ], 200);
        } catch (\Exception $e) {
            // Ghi log lỗi nếu có ngoại lệ
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
        try {

            // Lấy token từ header Authorization
            $token = $request->bearerToken();
            \Log::info('UpdateUser - Bearer token:', ['token' => $token]);

            $user = $request->user(); // Lấy user đã xác thực qua Sanctum
            \Log::info('UpdateUser - Authenticated user:', ['user_id' => $user ? $user->id : null]);

            // Lấy token từ header Authorization
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['message' => 'Token not provided'], 401);
            }

            // Kiểm tra xem user có quyền cập nhật thông tin không
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 403);
                Log::warning('Update user - Unauthorized: user not found');
            }

            // Chỉ cho phép user tự sửa thông tin của mình
            if ((string)$user->id !== (string)$id) {
                Log::warning('Update user - Forbidden: user id mismatch', ['user_id' => $user->id, 'request_id' => $id]);
                return response()->json(['message' => 'Forbidden'], 403);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $id,
                'phone' => 'nullable|string|max:20',
            ]);

            // Cập nhật thông tin người dùng trong bảng users
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            // Cập nhật thông tin người dùng trong bảng booking_rooms
            Booking::where('user_id', $id)->update([
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

    public function changePassword(Request $request, $id)
    {
        $user = $request->user(); // Lấy user đã xác thực qua Sanctum
        \Log::info('ChangePassword - user:', ['user_id' => $user ? $user->id : null]);
        \Log::info('ChangePassword - request:', $request->all());

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->id != $id) {
            \Log::warning('ChangePassword - Unauthorized access attempt', ['id' => $id, 'user_id' => $user->id]);
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validation dữ liệu
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        // Kiểm tra mật khẩu hiện tại
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        // Cập nhật mật khẩu mới
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully'], 200);
    }

    // function login with google (CAUTION: This function is dangerous, do not change anything here)
    public function redirectToGoogle()
    {
        try {
            Log::info('Redirecting to Google for login', [
                'client_id' => config('services.google.client_id'),
                'redirect_uri' => config('services.google.redirect'),
            ]);

            $url = Socialite::driver('google')
                ->setScopes([
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile',
                ])
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            Log::info('Google redirect URL generated', ['url' => $url]);
            return response()->json(['url' => $url], 200);
        } catch (\Exception $e) {
            Log::error('Google Redirect Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to redirect to Google: ' . $e->getMessage()], 500);
        }
    }

    public function handleGoogleCallback(Request $request)
    {
        try {
            Log::info('Google callback received', ['request' => $request->all()]);
            $googleUser = Socialite::driver('google')
                ->setHttpClient(new \GuzzleHttp\Client(['verify' => false]))
                ->stateless()
                ->user();

            $user = User::where('email', $googleUser->email)->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'password' => Hash::make(uniqid()),
                    'provider' => 'google',
                    'avatar' => $googleUser->avatar,
                ]);
            } else {
                $user->update([
                    'avatar' => $googleUser->avatar,
                ]);
            }

            if (!$user->remember_token) {
                $user->remember_token = \Illuminate\Support\Str::random(60);
                $user->save();
            }

            // Tạo token Sanctum cho user
        $token = $user->createToken('auth_token')->plainTextToken;
        \Log::info('GoogleCallback - Sanctum token:', ['token' => $token]);

            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'token' => $user->remember_token,
                'role' => $user->role,
                'status' => $user->status,
                'provider' => $user->provider,
                'avatar' => $user->avatar,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ];

            // Redirect về frontend với token và user trong query string
            $redirectUrl = 'http://localhost:8000/auth/callback?' . http_build_query([
                'token' => $token,
                'user' => json_encode($userData),
            ]);

            return redirect($redirectUrl);
        } catch (\Exception $e) {
            // Redirect về frontend với lỗi
            $redirectUrl = 'http://localhost:8000/auth/callback?' . http_build_query([
                'error' => 'Google login failed: ' . $e->getMessage(),
            ]);
            return redirect($redirectUrl);
        }
    }

    public function getUser(Request $request)
{
    $user = $request->user(); // Lấy user đã xác thực qua Sanctum

    if (!$user) {
        return response()->json(['message' => 'Unauthorized'], 401);
    }

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'avatar' => $user->avatar,
        'phone' => $user->phone,
        'role' => $user->role,
        'status' => $user->status,
    ]);
}


}
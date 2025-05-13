<?php

namespace App\Http\Controllers\Api;
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    public function index() // Đổi tên phương thức thành index
    {
        $users = User::where('role', 'user')->paginate(10);
        return response()->json($users);
    }
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function dataUser(Request $request)
    {
        try {
            // Lấy danh sách người dùng với role = 'user'
            $users = User::where('role', 'user')
                ->select('id', 'name', 'email', 'role', 'phone', 'email_verified_at', 'status', 'created_at', 'updated_at', 'provider') // Chỉ lấy các trường cần thiết
                ->get();

            return response()->json($users, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi lấy danh sách người dùng',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function show_staff()
    {
        $staff = User::where('role', 'staff')->paginate(10);
        return response()->json($staff);
    }
}
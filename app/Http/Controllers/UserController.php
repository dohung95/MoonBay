<?php

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
    public function show_staff()
    {
        $staff = User::where('role', 'staff')->paginate(10);
        return response()->json($staff);
    }
}
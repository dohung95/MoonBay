<?php

namespace App\Http\Controllers\Api;

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\UserManager;
use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    public function index() // Đổi tên phương thức thành index
    {
        $users = UserManager::where('role', 'user')->paginate(10);
        return response()->json($users);
    }
    public function destroy($id)
    {
        $user = UserManager::find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function show_staff()
    {
        $staff = UserManager::where('role', 'staff')->paginate(10);
        return response()->json($staff);
    }

    public function add_new(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:staff,admin,manager',
            'status' => 'required|string|in:active,inactive,suspended',
        ]);

        $user = UserManager::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'status' => $validated['status'],
            'password' => bcrypt('123456'),
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = UserManager::findOrFail($id);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|string|in:staff,admin,manager',
            'status' => 'required|string|in:active,inactive,banned',
        ]);

        $user->update($validated);

        return response()->json($user);
    }
}

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
}
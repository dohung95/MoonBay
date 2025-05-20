<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffCustomerNote extends Model
{
    use HasFactory;

    protected $table = 'customer_notes'; // Sử dụng bảng customer_notes

    protected $fillable = [
        'user_id',
        'staff_id',
        'note',
        'customer_status', // Thêm trường customer_status
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
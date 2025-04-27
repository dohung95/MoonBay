<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Booking extends Model
{
    use HasFactory;
    protected $table = 'booking_rooms';

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'room_type',
        'number_of_rooms',
        'children',
        'member',
        'checkin_date',
        'checkout_date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
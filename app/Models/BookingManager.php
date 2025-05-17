<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingManager extends Model
{
    protected $table = 'booking_rooms';
    protected $fillable = [
        'user_id', 'name', 'email', 'phone', 'room_type', 'number_of_rooms',
        'children', 'member', 'checkin_date', 'checkout_date', 'price', 'total_price'
    ];
}
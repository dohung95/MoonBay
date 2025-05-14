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
        '*'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
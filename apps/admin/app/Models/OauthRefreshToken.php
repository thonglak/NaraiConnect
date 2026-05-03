<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class OauthRefreshToken extends Model
{
    protected $table = 'oauth_refresh_tokens';
    protected $primaryKey = 'refresh_token';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'refresh_token',
        'client_id',
        'user_id',
        'expires',
        'scope',
    ];

    protected $casts = [
        'expires' => 'datetime',
    ];

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('expires', '>', now());
    }
}

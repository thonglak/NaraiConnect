<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class OauthAccessToken extends Model
{
    protected $table = 'oauth_access_tokens';
    protected $primaryKey = 'access_token';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'access_token',
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

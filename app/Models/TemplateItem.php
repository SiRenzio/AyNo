<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TemplateItem extends Model
{
    protected $fillable = ['description', 'position'];

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }
}

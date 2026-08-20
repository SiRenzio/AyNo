<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    protected $fillable = ['name', 'description', 'is_system_template'];

    protected function casts(): array
    {
        return ['is_system_template' => 'boolean'];
    }

    public function items(): HasMany
    {
        return $this->hasMany(TemplateItem::class)->orderBy('position');
    }
}

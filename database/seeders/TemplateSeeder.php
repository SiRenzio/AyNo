<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            'Claim Important Documents' => [
                'description' => 'For diplomas, certificates, IDs, and other official documents.',
                'items' => ['Official receipt', 'Valid government ID', 'Authorization letter, if needed', 'Claim stub or reference number'],
            ],
            'Medical Appointment' => [
                'description' => 'Prepare the essentials for a clinic or hospital visit.',
                'items' => ['Valid ID', 'Health card', 'Previous test results', 'List of current medications'],
            ],
            'Travel Day' => [
                'description' => 'A simple checklist for flights and long trips.',
                'items' => ['Tickets or booking confirmation', 'Valid ID or passport', 'Wallet and cash', 'Phone charger', 'Necessary medication'],
            ],
        ];

        foreach ($templates as $name => $data) {
            $template = Template::updateOrCreate(
                ['name' => $name],
                ['description' => $data['description'], 'is_system_template' => true],
            );

            $template->items()->delete();
            foreach ($data['items'] as $position => $description) {
                $template->items()->create(compact('description', 'position'));
            }
        }
    }
}

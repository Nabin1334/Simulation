@extends('layouts.app')
@php($hideHeaderFooter = true)
@section('css')
    <style>
        /* Paste the CSS from the HTML <style> block here */
        :root {
            --bg-dark: #0f172a;
            --bg-panel: #1e293b;
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.4);
            --accent: #06b6d4;
            --fire: #f59e0b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border: rgba(255, 255, 255, 0.1);
            --glass: rgba(30, 41, 59, 0.7);
            --radius: 24px;
            --sidebar-width: 280px;
            --success: #10b981;
            --error: #ef4444;
            --card-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --bottom-nav-height: 70px;
        }
        .light-theme {
            --bg-dark: #f1f5f9;
            --bg-panel: #ffffff;
            --primary: #4f46e5;
            --primary-glow: rgba(79, 70, 229, 0.2);
            --accent: #0891b2;
            --fire: #d97706;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border: rgba(15, 23, 42, 0.1);
            --glass: rgba(255, 255, 255, 0.9);
            --card-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        /* ...rest of the CSS from the HTML file... */
    </style>
@endsection

@section('js')
    @vite_module(['resources/js/ten/science/chapter_9/thermal_energy_heat_and_temperature/index.js'])
@endsection

@section('contentMain')
    <div id="thermal-lab-app">
        <!-- Paste the HTML body content (inside <body>) here, replacing <script> and <style> with Blade sections -->
    </div>
@endsection

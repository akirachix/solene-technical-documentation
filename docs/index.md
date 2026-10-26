---
layout: home
title: Canopy Documentation
---

<script setup>
import { withBase } from 'vitepress'
</script>

<div class="custom-home">
<div class="hero-section">
<div class="hero-content">
    <div class="canopy-eyebrow">TECHNICAL DOCUMENTATION</div>
    <h1 class="hero-title">Connecting field data<br>to veterinary care<span class="orange-dot">.</span></h1>
    <p class="hero-subtitle">Technical documentation for the CANOPY platform. Explore how our mobile app, backend APIs, and AI risk models support gorilla trackers and veterinary teams through offline sync and case management.</p>
    <div class="canopy-actions">
    <a :href="withBase('/overview')" class="btn-primary">Read the overview &rarr;</a>
    <a :href="withBase('/architecture')" class="btn-text">Explore architecture &rarr;</a>
    </div>
    </div>
<div class="hero-image">
<img :src="withBase('/canopy-home.png')" alt="Gorilla Illustration" />
</div>
</div>

<div class="section-divider">
<span>START HERE</span>
</div>

<div class="card-grid">
<a :href="withBase('/architecture')" class="canopy-card">
<div class="card-icon">
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
</div>
<h3>Architecture</h3>
<p>Understand the system structure, components and how they work together.</p>
<span class="card-link">View architecture &rarr;</span>
</a>

<a :href="withBase('/backend')" class="canopy-card">
<div class="card-icon">
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
</div>
<h3>Backend & API</h3>
<p>Explore the server, database, API endpoints and core business logic.</p>
<span class="card-link">View backend &rarr;</span>
</a>

<a :href="withBase('/frontend-mobile')" class="canopy-card">
<div class="card-icon">
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="4" ry="4"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
</div>
<h3>Mobile field app</h3>
<p>Learn how to use the mobile application, including offline support and synchronisation.</p>
<span class="card-link">View mobile app &rarr;</span>
</a>

<a :href="withBase('/security')" class="canopy-card">
<div class="card-icon">
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
</div>
<h3>Security</h3>
<p>See how we protect sensitive data, manage access and keep the platform secure.</p>
<span class="card-link">View security &rarr;</span>
</a>

<a :href="withBase('/design-guidelines')" class="canopy-card">
<div class="card-icon">
<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
</div>
<h3>Design System</h3>
<p>Explore the Solene brand identity, style guides, and Canopy UI assets.</p>
<span class="card-link">View design &rarr;</span>
</a>
</div>
</div>

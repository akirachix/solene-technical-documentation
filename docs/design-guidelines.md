---
title: Design System
description: Visual identity, style guides, and UI assets for Solene and Canopy.
status: verified
evidence: []
---

# Design System

This section defines the visual language for the Solene brand and the Canopy product. It serves as the bridge between the design files in Figma and the frontend implementation. By maintaining strict adherence to these guidelines, we ensure that the product remains consistent, accessible, and aligned with the organization's conservation mission.

## Figma Source Files

All raw design assets, wireframes, and final UI screens are maintained in Figma. The links below provide access to the complete workspace used by the design team.

- [Solene & Canopy Sketches](https://www.figma.com/design/qO1dfobIgmuSGuBBDSDZT9/Solene-sketches?node-id=0-1&p=f&t=eFclITM1tz36urfR-0)
- [Canopy Designs (UI)](https://www.figma.com/design/IhRzjQda6UCrtNo9cfluce/Sol%C3%A8ne-Final-Project-designs?node-id=553-807&t=EE9HpRbHl6DAiHBc-0)

## 1. Logos

The ecosystem uses two distinct logos. **Solene** represents the overarching conservation brand, NGO, and research organization. **Canopy** represents the specific software product used by the field teams and veterinarians.

### Solene (Brand)

The primary brand logo features a stylized geometric mark representing the interconnectedness of the ecosystem and the wordmark.

#### Solene Logo Sketches & Concepts

Early iterations and conceptual explorations for the Solene identity.

![Solene Brand Logo sketches and concepts](/design-solene-logo.png)

#### Solene Logo Variations

The logo is adaptable across different backgrounds and contexts, ensuring brand recognition in all mediums.

![Solene Brand Logo Variations](/brand.png)

#### Solene Final Logo

The finalized, approved mark for the overarching organization.

![Solene Final Logo](/solene.png)

### Canopy (Product)

The product logo features a distinct gorilla profile with the Canopy wordmark. This mark is designed to feel grounded and field-oriented, directly reflecting the core user base of trackers and conservationists.

#### Canopy Logo Sketches & Concepts

Exploration of the gorilla motif and typography for the product identity.

![Canopy Product Logo Sketches](/canopy-logo-sketches.png)

#### Canopy Logo Variations

Adaptable versions of the Canopy mark for different UI states and backgrounds.

![Canopy Brand Logo Variations](/product.png)

#### Canopy Final Logo

The finalized mark used across the mobile app and web dashboard.

![Canopy Final Logo](/canopy-logo.png)

## 2. Style Guide

The design system utilizes a shared typographic scale but maintains distinct color palettes for the Solene marketing brand and the functional Canopy product.

### Solene Style Guide

The Solene materials lean heavily on rich, earthy tones and typography to evoke a sense of nature, gravity, and rigor.

![Solene style guide](/solene-style.png)

### Canopy Style Guide

The Canopy product UI prioritizes readability, high contrast, and warmth. It uses a "paper and ink" aesthetic to reduce eye strain for field workers and veterinarians who spend long hours in the application.

![Canopy style guide](/canopy-style.png)

### Typography

Both Solene and Canopy use a dual-font system to balance editorial elegance with functional readability.

| Usage              | Font Family      | Weights                   | Notes                                                                     |
| :----------------- | :--------------- | :------------------------ | :------------------------------------------------------------------------ |
| Display / Headings | Playfair Display | Regular, Bold, Italic     | Used for marketing headlines and high-level page titles.                  |
| UI / Body          | Montserrat       | Regular, Medium, SemiBold | Used for all interface text, buttons, forms, and technical documentation. |

### Color Palette

The product (Canopy) uses the warm, functional palette documented in the `tech-stack` and `frontend` guides. Below are the exact hex codes used in the Tailwind configuration and CSS variables.

<div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
  <div style="flex: 1; padding: 2rem; background-color: #FF5A1F; border-radius: 8px; color: white; font-weight: bold; text-align: center;">
    #FF5A1F<br/>Primary Action Orange
  </div>
  <div style="flex: 1; padding: 2rem; background-color: #EDE2D7; border-radius: 8px; color: #160C1B; font-weight: bold; text-align: center; border: 1px solid #E5DCCB;">
    #EDE2D7<br/>App Background (Cream)
  </div>
  <div style="flex: 1; padding: 2rem; background-color: #160C1B; border-radius: 8px; color: white; font-weight: bold; text-align: center;">
    #160C1B<br/>Text (Ink)
  </div>
  <div style="flex: 1; padding: 2rem; background-color: #E5DCCB; border-radius: 8px; color: #160C1B; font-weight: bold; text-align: center;">
    #E5DCCB<br/>Borders
  </div>
</div>

## 3. Informational Website Design (Solene)

The marketing and informational website introduces the Solene mission ("Healthier gorillas. Stronger tomorrow.") and explains how the Canopy technology fits into the broader conservation ecosystem. It serves as the public-facing entry point for donors, researchers, and partners.

![Solene Informational Website](/informational.png)

### Live Website

You can view the deployed informational website here:

- [Solene Informational Website](https://soleneinformational-website.vercel.app/)

## 4. Product UI (Canopy)

The Canopy product is split into two distinct applications tailored to their specific environments: a web dashboard for veterinarians and administrators working in an office setting, and a mobile app designed explicitly for field trackers navigating rugged terrain.

### Web Dashboard

The web dashboard is a command center for case management, team administration, AI risk mapping, and clinical decision-making. It utilizes the cream background, dark sidebar, and orange accents to organize data into a readable interface.

![Canopy Web Dashboard](/web-ui.png)

### Mobile App

The mobile app is the primary tool for field data collection. It is designed for one-handed use in challenging environments, featuring high-contrast headers, large touch targets, and explicit offline state indicators.

#### Mobile Wireframes

Initial layout explorations for the tracker's field workflow.

![Canopy Mobile App Wireframes](/mobile-w.png)

#### Final Mobile UI

The implemented interface for the Flutter application, showcasing the observation recording and follow-up flow.

![Canopy Mobile App UI](/mobile-ui.png)

## 5. Summary & Implementation

By utilizing the shared technical tokens defined in this guide (such as the `#F7F2E8` background and `#F04416` action orange), developers can ensure that new features integrate seamlessly with the existing VitePress documentation and the frontend React/Flutter applications. All future UI components should be built by referencing the Figma source files and using the exact typography and color tokens listed above to maintain a cohesive, accessible, and trustworthy experience for our conservation teams.

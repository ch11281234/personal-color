# Architecture
- Run face and Teachable Machine inference only in browser-triggered dynamic imports; SSR must not initialize TensorFlow or access camera APIs.
- Teachable Machine selects the season, while the existing color scorer selects the detailed type within that season, preserving the recommendation catalogue.
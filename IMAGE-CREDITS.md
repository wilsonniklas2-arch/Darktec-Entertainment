# DARKTEC Festival Image Credits

This file records the selected editorial photographs used by the International Festival Directory.

All images are downloaded from Wikimedia Commons at build/import time by the GitHub Actions workflow. The workflow checks the Commons API license metadata against the expected license before saving each original file. If a file or license no longer matches, the workflow stops rather than silently substituting another image.

## Selected photographs

| Festival | Local file | Photographer / creator | Original file | License |
|---|---|---|---|---|
| Rock am Ring | `assets/images/festivals/rock-am-ring.jpg` | Andreas Lawen / Fotandi | [Festivalgelände - Rock am Ring 2022-5399.jpg](https://commons.wikimedia.org/wiki/File:Festivalgel%C3%A4nde_-_Rock_am_Ring_2022-5399.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Tomorrowland | `assets/images/festivals/tomorrowland.jpg` | Arroser | [Tomorrowland mainstage close 21juillet2019.jpg](https://commons.wikimedia.org/wiki/File:Tomorrowland_mainstage_close_21juillet2019.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Glastonbury | `assets/images/festivals/glastonbury.jpg` | Bennydigital | [View of Glastonbury Festival from the Park Stage as crowd arrives for Pulp, 2011.jpg](https://commons.wikimedia.org/wiki/File:View_of_Glastonbury_Festival_from_the_Park_Stage_as_crowd_arrives_for_Pulp%2C_2011.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) (the file page also offers GFDL; this project uses CC BY-SA 3.0) |
| Wacken Open Air | `assets/images/festivals/wacken.jpg` | Frank Schwichtenberg | [Wacken Open Air 2022 01.jpg](https://commons.wikimedia.org/wiki/File:Wacken_Open_Air_2022_01.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Montreux Jazz Festival | `assets/images/festivals/montreux-jazz.jpg` | EGilham | [General 2026 Montreux Jazz Festival.jpg](https://commons.wikimedia.org/wiki/File:General_2026_Montreux_Jazz_Festival.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Coachella | `assets/images/festivals/coachella.jpg` | Sam Howzit | [Coachella 2014 Lightweaver and Escape Velocity.jpg](https://commons.wikimedia.org/wiki/File:Coachella_2014_Lightweaver_and_Escape_Velocity.jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) |

## Attribution and changes

- The photographer/creator, source file page and license are linked above.
- The directory displays the photographs as cropped card images using CSS `object-fit: cover`; this is a display crop, not a claim that the original file was altered.
- If any image is resized, recolored, retouched or otherwise adapted as a file, the adaptation will be identified in the attribution record.
- CC BY-SA images and adaptations must be shared under the same or a compatible license. This requirement applies to the image/adaptation, not automatically to the entire DARKTEC website.
- The Coachella image is CC BY 2.0 and requires attribution and a license link, but has no ShareAlike requirement.

## Rights and editorial-use notes

Wikimedia Commons file pages for Rock am Ring, Wacken and Montreux include personality-rights or similar notices. A copyright license from the photographer does not itself grant model releases, privacy rights, trademark rights or endorsement rights for identifiable people, brands or event marks. These photographs are therefore used as editorial festival-directory illustrations, not as endorsements, advertisements for third parties, merchandise artwork or claims of partnership. Any broader promotional use should receive a separate rights review.

## Automated import

The workflow at `.github/workflows/import-festival-images.yml` retrieves the exact Commons file titles listed above. It checks the API-reported license against the expected license, downloads the original file, and writes `assets/images/festivals/credits.json` with the metadata returned by Commons. It does not search for substitutes.

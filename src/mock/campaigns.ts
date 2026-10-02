import { delay } from './delay'
import type { Campaign } from '@/types/campaign'

const campaigns: Campaign[] = [
  {
    id: 'cmp-01',
    brandName: 'Aurora Beauty',
    brandLogoUrl: 'https://i.pravatar.cc/80?u=aurora-beauty',
    title: 'Spring skincare launch — 3 short videos',
    budget: 8500,
    dueDate: '2026-10-18',
    status: 'pending',
    category: 'Beauty',
    brief:
      'Create three vertical videos (30–45s) highlighting the spring skincare line. Open with a hook in the first 2 seconds, demonstrate product texture on skin, and include a clear CTA to the brand shop link in the caption.\n\nTone: clean, bright, trustworthy. Avoid medical claims. Hashtag #AuroraSpring required on all posts.',
    attachments: [
      { id: 'a1', name: 'Brand_Guidelines.pdf', sizeLabel: '2.4 MB' },
      { id: 'a2', name: 'Product_Assets.zip', sizeLabel: '48 MB' },
    ],
  },
  {
    id: 'cmp-02',
    brandName: 'NovaTech',
    brandLogoUrl: 'https://i.pravatar.cc/80?u=novatech',
    title: 'Desk lamp unboxing + setup tour',
    budget: 6200,
    dueDate: '2026-10-12',
    status: 'in_progress',
    category: 'Tech',
    brief:
      'Film a desk setup tour featuring the NovaTech soft lamp. Show unboxing, assembly, and before/after lighting comparison. Minimum runtime 90 seconds.\n\nDeliverables: 1 main video + 3 story cutdowns. Submit draft for review before publishing.',
    attachments: [{ id: 'a3', name: 'Shot_List.docx', sizeLabel: '180 KB' }],
  },
  {
    id: 'cmp-03',
    brandName: 'Lumen Coffee',
    brandLogoUrl: 'https://i.pravatar.cc/80?u=lumen-coffee',
    title: 'Cafe hopping reel series (3 episodes)',
    budget: 4800,
    dueDate: '2026-10-08',
    status: 'under_review',
    category: 'Lifestyle',
    brief:
      'Three-part reel series visiting partner cafés. Each episode should feature one signature drink and a 15-second B-roll montage of the space.\n\nCurrent draft under brand review — expect feedback within 48 hours.',
    attachments: [{ id: 'a4', name: 'Location_Permits.pdf', sizeLabel: '890 KB' }],
  },
  {
    id: 'cmp-04',
    brandName: 'FitPulse',
    brandLogoUrl: 'https://i.pravatar.cc/80?u=fitpulse',
    title: 'Weekend warm-up stretch sponsored post',
    budget: 3200,
    dueDate: '2026-09-28',
    status: 'completed',
    category: 'Fitness',
    brief:
      'Completed campaign: 60s warm-up routine with FitPulse mat visible throughout. Payment released upon final analytics report.',
    attachments: [],
  },
  {
    id: 'cmp-05',
    brandName: 'SkyTrail Outdoor',
    brandLogoUrl: 'https://i.pravatar.cc/80?u=skytrail',
    title: 'Night city walkthrough product placement',
    budget: 9100,
    dueDate: '2026-10-22',
    status: 'pending',
    category: 'Outdoor',
    brief:
      'Night walkthrough vlog with subtle placement of SkyTrail headlamp during the final 30 seconds. Focus on urban atmosphere; product should feel organic, not scripted.\n\nAcceptance required before receiving shipping samples.',
    attachments: [
      { id: 'a5', name: 'Creative_Brief.pdf', sizeLabel: '1.1 MB' },
      { id: 'a6', name: 'Product_Specs.pdf', sizeLabel: '540 KB' },
    ],
  },
  {
    id: 'cmp-06',
    brandName: 'SoftLight Co.',
    brandLogoUrl: 'https://i.pravatar.cc/80?u=softlight',
    title: 'Product unboxing live premiere',
    budget: 12500,
    dueDate: '2026-10-15',
    status: 'in_progress',
    category: 'Home',
    brief:
      'Host a 90-minute live premiere with unboxing segment in the first 15 minutes. Coordinate with brand rep for Q&A slot.\n\nSubmit recorded highlights within 24 hours after the stream.',
    attachments: [{ id: 'a7', name: 'Live_Run_of_Show.pdf', sizeLabel: '320 KB' }],
  },
  {
    id: 'cmp-07',
    brandName: 'Kyoto Trails',
    brandLogoUrl: 'https://i.pravatar.cc/80?u=kyoto-trails',
    title: 'Travel vlog destination partnership',
    budget: 15800,
    dueDate: '2026-10-05',
    status: 'under_review',
    category: 'Travel',
    brief:
      'Long-form travel vlog (8–12 min) covering Kyoto alley districts. Include branded end card and pinned comment with affiliate link.\n\nDraft submitted — awaiting tourism board compliance check.',
    attachments: [
      { id: 'a8', name: 'Compliance_Checklist.pdf', sizeLabel: '760 KB' },
      { id: 'a9', name: 'B-Roll_References.mp4', sizeLabel: '124 MB' },
    ],
  },
  {
    id: 'cmp-08',
    brandName: 'EditLab',
    brandLogoUrl: 'https://i.pravatar.cc/80?u=editlab',
    title: '60s editing tips brand challenge',
    budget: 2700,
    dueDate: '2026-09-20',
    status: 'completed',
    category: 'Education',
    brief:
      'Challenge format: teach one editing trick in under 60 seconds using EditLab presets. Campaign closed successfully.',
    attachments: [],
  },
]

export async function fetchCampaigns(): Promise<Campaign[]> {
  await delay(800)
  return campaigns.map((item) => ({
    ...item,
    attachments: item.attachments.map((a) => ({ ...a })),
  }))
}

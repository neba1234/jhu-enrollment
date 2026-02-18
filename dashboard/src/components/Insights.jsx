import { TrendingUp, Award, MapPin, Lightbulb } from 'lucide-react';
import { SectionTitle } from './UI';

const insights = [
  {
    icon: MapPin,
    title: 'Baltimore Is Our Anchor City',
    body: '4 leaders, 9 enrollments, and a 92.1% average score — Baltimore shows the deepest institutional engagement across both GovEx and BCPI programs.',
  },
  {
    icon: Award,
    title: 'High Completion Across the Board',
    body: '90% of all enrollments are completed with an average score of 91.8%. Only 5 enrollments are still in progress — indicating strong follow-through from participating leaders.',
  },
  {
    icon: TrendingUp,
    title: 'West Coast & Southwest Emerging',
    body: 'San Francisco (8 enrollments), Austin (6), and Phoenix (5) round out our top cities. Seattle shows the highest avg. score at 95.3%, suggesting particularly strong candidates there.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation Courses Drive Volume',
    body: 'Innovation 101 (5 enrollments) is the most popular entry-point course, followed by performance and data governance courses — suggesting leaders are seeking both innovation and operational skills.',
  },
];

export default function Insights() {
  return (
    <div>
      <SectionTitle title="Key Insights for the Dean" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {insights.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              style={{
                background: 'white',
                borderLeft: '4px solid var(--gold)',
                borderRadius: '0 var(--radius) var(--radius) 0',
                padding: '1.1rem 1.25rem',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '.45rem',
                  fontWeight: 600,
                  fontSize: '.85rem',
                  color: 'var(--navy)',
                  marginBottom: '.35rem',
                }}
              >
                <Icon size={16} />
                {item.title}
              </div>
              <div style={{ fontSize: '.82rem', color: 'var(--slate)', lineHeight: 1.55 }}>
                {item.body}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

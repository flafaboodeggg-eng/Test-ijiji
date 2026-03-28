import { Metadata } from 'next';
import NovelPageScreen from '@/screens/NovelPage';

async function getNovel(slug: string) {
  const apiUrl = `https://backend-moon-lilac.vercel.app/api/novels/${slug}`;
  try {
    const res = await fetch(apiUrl, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const novel = await res.json();
    return novel;
  } catch (error) {
    console.error('Error fetching novel for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const novel = await getNovel(params.slug);
  if (!novel) {
    return {
      title: 'الرواية غير موجودة | قمر الروايات',
      description: 'عذراً، الرواية التي تبحث عنها غير متوفرة.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://moonnovel.vercel.app';
  const imageUrl = novel.cover?.startsWith('http') ? novel.cover : `${baseUrl}${novel.cover}`;

  return {
    title: `رواية ${novel.title} | قمر الروايات`,
    description: novel.description?.slice(0, 160) || `اقرأ رواية ${novel.title} على قمر الروايات.`,
    openGraph: {
      title: `رواية ${novel.title} - قمر الروايات`,
      description: novel.description?.slice(0, 160),
      url: `${baseUrl}/novel/${params.slug}`,
      siteName: 'قمر الروايات',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `غلاف رواية ${novel.title}` }],
      type: 'book',
      locale: 'ar_AR',
    },
    twitter: {
      card: 'summary_large_image',
      title: `رواية ${novel.title} | قمر الروايات`,
      description: novel.description?.slice(0, 160),
      images: [imageUrl],
    },
  };
}

export default function NovelPage() {
  return <NovelPageScreen />;
}
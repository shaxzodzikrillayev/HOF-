import type { About } from '@/types';

export const ABOUT_ID = '00000000-0000-0000-0000-000000000001';

export const DEFAULT_ABOUT: Omit<About, 'updated_at'> = {
  id: ABOUT_ID,
  title_ru: 'История с ароматом кофе',
  title_uz: 'Kofe hidi bilan boshlangan tarix',
  content_ru:
    'HOFÉ — это уютное кафе в центре Ташкента, где европейская кухня встречается с тёплым гостеприимством.\nМы начали в 2019 году с маленькой кофейни на шесть столиков и выросли в пространство, где собираются друзья, семьи и все, кто ценит вкус и детали.\nКаждое блюдо мы готовим из свежих локальных продуктов, а кофейные зёрна обжариваем специально для нас — поэтому наш кофе всегда особенный.',
  content_uz:
    'HOFÉ — Toshkent markazidagi yoqimli kafe bo‘lib, bu yerda Yevropa oshxonasi iliq mehmondo‘stlik bilan uchrashadi.\nBiz 2019-yilda oltita stolli kichik qahvaxonadan boshlab, bugun do‘stlar, oilalar va mazalli taomlarga qadri yetadiganlar uchun makon bo‘ldik.\nHar bir taomni yangi mahalliy mahsulotlardan tayyorlaymiz, kahva donlarini esa maxsus biz uchun qovuramiz — shuning uchun kahvamiz har doim alohida.',
  image_url:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
};

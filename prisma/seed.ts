import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({
  url: `file:${dbPath}`
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean old data
  await prisma.product.deleteMany({});
  await prisma.promo.deleteMany({});
  await prisma.review.deleteMany({});

  // Seed Products
  await prisma.product.create({
    data: {
      title: 'Кухня Арт. ЦМ - 001',
      slug: 'art-cm-001',
      shape: 'угловая',
      frontType: 'ЛДСП',
      price: 155000,
      imageUrl: '/images/kitchen1.webp',
      width: 4800,
      height: 2500,
      depth: 1600,
      materials: 'ЛДСП, Столешница Люксформ',
      hardware: 'Blum',
      backlight: 'Диодная - теплая',
      description: 'Современная и лаконичная угловая кухня с фасадами из ЛДСП. Идеальный баланс цены и качества.',
      seo_title: 'Купить угловую кухню Арт. ЦМ - 001 на заказ в Москве - Цветков Мебель',
      seo_description: 'Заказать премиальную угловую кухню Арт. ЦМ - 001 с фасадами из ЛДСП и фурнитурой Blum. Индивидуальный проект от 7 дней.'
    }
  });

  await prisma.product.create({
    data: {
      title: 'Кухня Арт. ЦМ - 002',
      slug: 'art-cm-002',
      shape: 'угловая',
      frontType: 'Alvic',
      price: 285000,
      imageUrl: '/images/kitchen2.webp',
      width: 3600,
      height: 2600,
      depth: 1800,
      materials: 'Alvic Luxe Белый Глянец',
      hardware: 'Blum',
      backlight: 'Диодная - теплая',
      description: 'Элегантная угловая кухня с высокоглянцевыми фасадами Alvic. Придает помещению ощущение простора и света.',
      seo_title: 'Элегантная глянцевая кухня Alvic Арт. ЦМ - 002 - Цветков Мебель',
      seo_description: 'Закажите современную угловую кухню Арт. ЦМ - 002 с фасадами Alvic Luxe. Доставка 50 км от МКАД бесплатно.'
    }
  });

  await prisma.product.create({
    data: {
      title: 'Кухня Арт. ЦМ - 004',
      slug: 'art-cm-004',
      shape: 'угловая',
      frontType: 'Fenix',
      price: 320000,
      imageUrl: '/images/kitchen4.webp',
      width: 4200,
      height: 2450,
      depth: 1500,
      materials: 'Fenix NTM Nero',
      hardware: 'Blum',
      backlight: 'Диодная - нейтральная',
      description: 'Премиальная кухня с ультраматовыми фасадами Fenix. Не оставляет отпечатков пальцев, приятна на ощупь.',
      seo_title: 'Матовая кухня Fenix Арт. ЦМ - 004 на заказ в Москве',
      seo_description: 'Современная кухня Арт. ЦМ - 004 с нано-технологичными фасадами Fenix NTM. Изготовление от 7 рабочих дней, гарантия 5 лет.'
    }
  });

  await prisma.product.create({
    data: {
      title: 'Кухня Арт. ЦМ - 005',
      slug: 'art-cm-005',
      shape: 'прямая',
      frontType: 'AGT',
      price: 198000,
      imageUrl: '/images/kitchen5.webp',
      width: 3000,
      height: 2400,
      depth: 600,
      materials: 'AGT Supramat Серый Шелк',
      hardware: 'Hettich',
      backlight: 'Диодная - теплая',
      description: 'Прямая современная кухня с шелковисто-матовыми фасадами AGT.',
      seo_title: 'Прямая матовая кухня AGT Арт. ЦМ - 005 - Заказать онлайн',
      seo_description: 'Заказать стильную прямую кухню с фасадами AGT Supramat в Москве. Предоплата 30%, беспроцентная рассрочка.'
    }
  });

  await prisma.product.create({
    data: {
      title: 'Кухня Арт. ЦМ - 006',
      slug: 'art-cm-006',
      shape: 'П-образная',
      frontType: 'МДФ эмаль',
      price: 395000,
      imageUrl: '/images/kitchen6.webp',
      width: 4200,
      height: 2450,
      depth: 2400,
      materials: 'МДФ Эмаль Матовая, столешница искусственный камень',
      hardware: 'Blum',
      backlight: 'Диодная - нейтральная',
      description: 'Роскошная П-образная кухня с фасадами из крашеного МДФ (эмаль). Просторная рабочая зона и премиальная фурнитура Blum.',
      seo_title: 'П-образная кухня из МДФ эмаль Арт. ЦМ - 006 на заказ',
      seo_description: 'Премиальная П-образная кухня Арт. ЦМ - 006 с матовыми фасадами МДФ эмаль и каменной столешницей. Рассрочка 0%.'
    }
  });

  await prisma.product.create({
    data: {
      title: 'Кухня Арт. ЦМ - 007',
      slug: 'art-cm-007',
      shape: 'с островом',
      frontType: 'Пластик',
      price: 450000,
      imageUrl: '/images/kitchen7.webp',
      width: 3800,
      height: 2500,
      depth: 2200,
      materials: 'Пластик HPL, фурнитура Hettich',
      hardware: 'Hettich',
      backlight: 'Диодная - холодная',
      description: 'Стильная и функциональная кухня с островом. Фасады облицованы износостойким HPL пластиком, устойчивым к царапинам.',
      seo_title: 'Кухня с островом и пластиковыми фасадами Арт. ЦМ - 007',
      seo_description: 'Кухня с островом Арт. ЦМ - 007 из HPL пластика. Износостойкие фасады, фурнитура Hettich. Замер и 3D-проект бесплатно.'
    }
  });

  await prisma.product.create({
    data: {
      title: 'Кухня Арт. ЦМ - 008',
      slug: 'art-cm-008',
      shape: 'прямая',
      frontType: 'МДФ ПВХ',
      price: 175000,
      imageUrl: '/images/kitchen8.webp',
      width: 3200,
      height: 2350,
      depth: 600,
      materials: 'МДФ в пленке ПВХ Soft-touch, петли Boyard',
      hardware: 'Boyard',
      backlight: 'Диодная - теплая',
      description: 'Компактная прямая кухня с фасадами МДФ в пленке ПВХ с эффектом Soft-touch. Отличное практичное решение для небольших квартир.',
      seo_title: 'Компактная прямая кухня МДФ ПВХ Арт. ЦМ - 008',
      seo_description: 'Прямая кухня Арт. ЦМ - 008 Soft-touch МДФ ПВХ. Качественная фурнитура Boyard. Рассрочка без первого взноса.'
    }
  });

  await prisma.product.create({
    data: {
      title: 'Кухня Арт. ЦМ - 009',
      slug: 'art-cm-009',
      shape: 'угловая',
      frontType: 'ЛДСП EGGER',
      price: 210000,
      imageUrl: '/images/kitchen9.webp',
      width: 3400,
      height: 2400,
      depth: 1600,
      materials: 'ЛДСП EGGER (Австрия), влагостойкая столешница',
      hardware: 'Hettich',
      backlight: 'Диодная - нейтральная',
      description: 'Современная угловая кухня с фасадами из австрийского ЛДСП EGGER с текстурой натурального дуба и бетона.',
      seo_title: 'Угловая кухня ЛДСП EGGER Арт. ЦМ - 009 на заказ',
      seo_description: 'Угловая современная кухня Арт. ЦМ - 009 из австрийских панелей EGGER. Надежная фурнитура Hettich, гарантия 5 лет.'
    }
  });

  // Seed Promos
  await prisma.promo.create({
    data: {
      title: 'Комплексный заказ мебели',
      discount: '15%',
      description: 'Скидка 15% предоставляется при заказе от двух единиц мебели (например, кухня + гардеробная) общей стоимостью от 500 000 рублей.',
      seo_title: 'Акция: Скидка 15% на комплексный заказ мебели - Цветков Мебель',
      seo_description: 'Сэкономьте на мебели для всего дома. Закажите от двух позиций и получите скидку 15%. Подробности на сайте.'
    }
  });

  await prisma.promo.create({
    data: {
      title: 'Гарантированная скидка',
      discount: 'до 10%',
      description: 'Каждый клиент гарантированно получает скидку до 10% на изготовление кухни при оформлении замера в день обращения.',
      seo_title: 'Скидка до 10% при заказе кухни в день замера',
      seo_description: 'Оставьте заявку на замер сегодня и получите гарантированную персональную скидку до 10% на весь проект.'
    }
  });

  await prisma.promo.create({
    data: {
      title: 'Скидка на бытовую технику',
      discount: 'до 30%',
      description: 'При покупке кухни у нас вы можете заказать встраиваемую технику по оптовым ценам со скидкой до 30%.',
      seo_title: 'Встраиваемая техника со скидкой до 30% при заказе кухни',
      seo_description: 'Поможем подобрать духовой шкаф, варочную панель и вытяжку. Покупка техники по оптовым ценам с экономией до 30%.'
    }
  });

  // Seed Reviews
  await prisma.review.create({
    data: {
      author: 'Екатерина',
      rating: 5,
      title: 'Спасибо Цветков Мебель',
      text: 'Здравствуйте! Я заказывала кухню в «Цветков Мебель». Нашли их в телеграм канале. В общем, дизайнер к нам приехал, все померил. Самое главное, мне понравилось, что дизайнер нарисовал проект у нас дома. Мне никуда не надо было ездить и это большой плюс, потому что не все приезжают. Приходится тащиться через всю Москву в офисы, а здесь все удобно было на дому. Мне понравились установщики - очень хорошо все сделали. В общем, все супер, все понравилось. Спасибо, большое «Цветков Мебель» - будем рекомендовать Вас всем своим друзьям.',
      seo_title: 'Отзыв Екатерины о заказе кухни в Цветков Мебель',
      seo_description: 'Читать отзыв о качестве обслуживания, дизайне на дому и сборке мебели от Цветков Мебель.'
    }
  });

  await prisma.review.create({
    data: {
      author: 'Михаил',
      rating: 5,
      title: 'Будем заказывать дальше',
      text: 'Здравствуйте. Хотел рассказать в двух словах о сотрудничестве с компанией "Цветков Мебель". Мы у них много чего заказали: гардеробную, кухню. Мы компанией остались довольны. Всё сделали в срок и качественно. Самое главное, нашли общий язык и будем заказывать у них дальше.',
      seo_title: 'Отзыв Михаила о качестве сборки и сроках - Цветков Мебель',
      seo_description: 'Отзыв клиента Михаила о сотрудничестве, сроках изготовления и сборке гардеробной и кухни.'
    }
  });

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

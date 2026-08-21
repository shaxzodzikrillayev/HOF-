import type { Language } from '@/types';

export type TranslationKey = keyof typeof translations;

const translations = {
  // Header / nav
  'nav.menu': { ru: 'Меню', uz: 'Menyu' },
  'nav.about': { ru: 'О нас', uz: 'Biz haqimizda' },
  'nav.reviews': { ru: 'Отзывы', uz: 'Sharhlar' },
  'nav.orders': { ru: 'Заказы', uz: 'Buyurtmalar' },
  'nav.viewMenu': { ru: 'Посмотреть меню', uz: 'Menyuni ko‘rish' },

  // Hero
  'hero.greeting': {
    ru: 'Добро пожаловать в HOFÉ',
    uz: 'HOFÉ ga xush kelibsiz',
  },
  'hero.tagline': {
    ru: 'Кофе, кухня и атмосфера — всё, что нужно для идеального дня в сердце Ташкента.',
    uz: 'Kofe, oshxona va muhit — Toshkent qalbidagi mukammal kun uchun kerak bo‘lgan hamma narsa.',
  },
  'hero.scroll': { ru: 'Листайте вниз', uz: 'Pastga suring' },

  // Menu section
  'menu.title': { ru: 'Меню', uz: 'Menyu' },
  'menu.subtitle': {
    ru: 'Готовим из свежих продуктов каждый день',
    uz: 'Har kuni yangi mahsulotlardan tayyorlaymiz',
  },
  'menu.all': { ru: 'Всё меню', uz: 'Barchasi' },
  'menu.featured': { ru: 'Рекомендуем', uz: 'Tavsiya etamiz' },
  'menu.empty': { ru: 'В этой категории пока нет блюд', uz: 'Bu kategoriyada hozircha taom yo‘q' },
  'menu.unavailable': { ru: 'Нет в наличии', uz: 'Mavjud emas' },
  'menu.lowStock': {
    ru: 'Осталось {count} шт.',
    uz: '{count} dona qoldi',
  },
  'badge.new': { ru: 'Новинка', uz: 'Yangi' },
  'tag.spicy': { ru: 'Острое', uz: 'Achchiq' },
  'tag.vegetarian': { ru: 'Вегетарианское', uz: 'Vegetar' },
  'tag.popular': { ru: 'Популярное', uz: 'Mashhur' },

  // Product view (dish modal)
  'product.category': { ru: 'Категория', uz: 'Kategoriya' },
  'product.inStock': { ru: 'В наличии', uz: 'Mavjud' },
  'product.outOfStock': { ru: 'Нет в наличии', uz: 'Mavjud emas' },
  'product.lowStock': { ru: 'Осталось {count} шт.', uz: '{count} dona qoldi' },
  'product.weight': { ru: 'Вес / объём', uz: 'Vazn / hajm' },
  'product.reviews': { ru: 'Отзывы', uz: 'Sharhlar' },
  'product.reviewsCount': { ru: '{count} отзывов', uz: '{count} ta sharh' },
  'product.noReviews': {
    ru: 'Пока нет отзывов об этом блюде — станьте первым!',
    uz: "Bu taom haqida hozircha sharhlar yo'q — birinchi bo'ling!",
  },
  'product.leaveReview': { ru: 'Оставить отзыв', uz: 'Sharh qoldirish' },
  'product.galleryOf': { ru: '{current} из {total}', uz: '{current} / {total}' },

  // Review form (public)
  'reviewForm.title': { ru: 'Оставить отзыв', uz: 'Sharh qoldirish' },
  'reviewForm.subtitle': {
    ru: 'Поделитесь впечатлениями о блюде',
    uz: 'Taom haqidagi taassurotlaringiz bilan bo‘lishing',
  },
  'reviewForm.name': { ru: 'Ваше имя', uz: 'Ismingiz' },
  'reviewForm.rating': { ru: 'Оценка', uz: 'Baho' },
  'reviewForm.text': { ru: 'Текст отзыва', uz: 'Sharh matni' },
  'reviewForm.textPlaceholder': {
    ru: 'Расскажите, что вам понравилось…',
    uz: 'Sizga nima yoqqanini ayting…',
  },
  'reviewForm.submit': { ru: 'Отправить отзыв', uz: 'Sharhni yuborish' },
  'reviewForm.sending': { ru: 'Отправка…', uz: 'Yuborilmoqda…' },
  'reviewForm.thanks': { ru: 'Спасибо за ваш отзыв! ⭐', uz: 'Sharhingiz uchun rahmat! ⭐' },
  'reviewForm.errorName': { ru: 'Укажите имя (минимум 2 символа)', uz: 'Ismni kiriting (kamida 2 belgi)' },
  'reviewForm.errorText': { ru: 'Напишите текст отзыва', uz: 'Sharh matnini yozing' },
  'reviewForm.error': {
    ru: 'Не удалось отправить отзыв. Попробуйте ещё раз.',
    uz: 'Sharhni yuborib bo‘lmadi. Yana urinib ko‘ring.',
  },

  // Table banner (QR menu)
  'table.banner': { ru: 'Стол №{number}', uz: '{number}-stol' },
  'table.hint': { ru: 'Заказ будет передан на этот стол', uz: 'Buyurtma shu stolga yetkaziladi' },

  // About
  'about.title': { ru: 'О нас', uz: 'Biz haqimizda' },

  // Reviews (public)
  'reviews.title': { ru: 'Отзывы гостей', uz: 'Mehmonlar sharhlari' },
  'reviews.subtitle': {
    ru: 'Реальные впечатления людей о атмосфере, кухне и сервисе HOFÉ.',
    uz: 'HOFÉ muhiti, oshxonasi va xizmati haqida odamlarning haqiqiy taassurotlari.',
  },
  'reviews.basedOn': {
    ru: '{count} отзывов',
    uz: '{count} ta sharh',
  },
  'reviews.empty': {
    ru: 'Отзывов пока нет — станьте первым!',
    uz: 'Hozircha sharhlar yo‘q — birinchi bo‘ling!',
  },

  // Footer
  'footer.rights': { ru: 'Все права защищены', uz: 'Barcha huquqlar himoyalangan' },
  'footer.admin': { ru: 'Панель управления', uz: 'Boshqaruv paneli' },

  // Common
  'common.cancel': { ru: 'Отмена', uz: 'Bekor qilish' },
  'common.save': { ru: 'Сохранить', uz: 'Saqlash' },
  'common.saving': { ru: 'Сохранение…', uz: 'Saqlanmoqda…' },
  'common.delete': { ru: 'Удалить', uz: "O'chirish" },
  'common.edit': { ru: 'Изменить', uz: 'Tahrirlash' },
  'common.add': { ru: 'Добавить', uz: 'Qo‘shish' },
  'common.close': { ru: 'Закрыть', uz: 'Yopish' },
  'common.search': { ru: 'Поиск…', uz: 'Qidirish…' },
  'common.all': { ru: 'Все', uz: 'Hammasi' },
  'common.available': { ru: 'Доступно', uz: 'Mavjud' },
  'common.hidden': { ru: 'Скрыто', uz: 'Yashirilgan' },
  'common.actions': { ru: 'Действия', uz: 'Amallar' },
  'common.error': { ru: 'Ошибка', uz: 'Xatolik' },
  'common.optional': { ru: 'необязательно', uz: 'majburiy emas' },
  'common.preview': { ru: 'Просмотр', uz: 'Ko‘rish' },
  'common.view': { ru: 'Просмотр', uz: 'Ko‘rish' },
  'common.status': { ru: 'Статус', uz: 'Holat' },
  'common.sort': { ru: 'Сортировка', uz: 'Saralash' },
  'common.prev': { ru: 'Назад', uz: 'Oldingi' },
  'common.next': { ru: 'Вперёд', uz: 'Keyingi' },
  'common.dragHint': {
    ru: 'Перетащите, чтобы изменить порядок',
    uz: 'Tartibni o‘zgartirish uchun sudrang',
  },
  'common.orderUp': { ru: 'Выше', uz: 'Yuqoriga' },
  'common.orderDown': { ru: 'Ниже', uz: 'Pastga' },

  // Cart & checkout
  'cart.title': { ru: 'Корзина', uz: 'Savat' },
  'cart.add': { ru: 'В корзину', uz: 'Savatga' },
  'cart.addToCart': { ru: 'В корзину', uz: 'Savatga qo‘shish' },
  'cart.empty': { ru: 'Корзина пуста', uz: 'Savat bo‘sh' },
  'cart.emptyHint': {
    ru: 'Выберите блюда из меню — они появятся здесь.',
    uz: 'Menyudan taomlarni tanlang — ular shu yerda paydo bo‘ladi.',
  },
  'cart.browseMenu': { ru: 'Перейти к меню', uz: 'Menyuga o‘tish' },
  'cart.total': { ru: 'Итого', uz: 'Jami' },
  'checkout.details': { ru: 'Данные для заказа', uz: 'Buyurtma ma’lumotlari' },
  'checkout.name': { ru: 'Ваше имя', uz: 'Ismingiz' },
  'checkout.phone': { ru: 'Номер телефона', uz: 'Telefon raqami' },
  'checkout.comment': { ru: 'Комментарий', uz: 'Izoh' },
  'checkout.cash': { ru: 'Наличными', uz: 'Naqd pul' },
  'checkout.card': { ru: 'Картой', uz: 'Karta bilan' },
  'checkout.place': { ru: 'Оформить заказ', uz: 'Buyurtma berish' },
  'checkout.success': { ru: 'Заказ успешно оформлен!', uz: 'Buyurtma muvaffaqiyatli rasmiylashtirildi!' },
  'checkout.phoneInvalid': {
    ru: 'Введите корректный номер телефона',
    uz: 'To‘g‘ri telefon raqamini kiriting',
  },
  'checkout.doneTitle': { ru: 'Спасибо за заказ!', uz: 'Buyurtmangiz uchun rahmat!' },
  'checkout.doneText': {
    ru: 'Заказ #{number} принят. Мы позвоним вам для подтверждения в ближайшее время.',
    uz: '#{number} buyurtma qabul qilindi. Tasdiqlash uchun tez orada sizga qo‘ng‘iroq qilamiz.',
  },
  'checkout.doneTextTable': {
    ru: 'Заказ #{number} принят. Официант скоро подойдёт к столу №{table}.',
    uz: '#{number} buyurtma qabul olindi. Ofitsiant tez orada {table}-stolga keladi.',
  },
  'checkout.continue': { ru: 'Продолжить', uz: 'Davom etish' },
  'checkout.table': { ru: 'Стол №{number}', uz: '{number}-stol' },

  // Orders
  'orders.title': { ru: 'Заказы', uz: 'Buyurtmalar' },
  'orders.subtitle': {
    ru: 'Управляйте заказами и отслеживайте их статусы',
    uz: 'Buyurtmalarni boshqaring va holatlarini kuzatib boring',
  },
  'orders.search': { ru: 'Поиск по номеру, имени, телефону…', uz: 'Raqam, ism, telefon bo‘yicha qidirish…' },
  'orders.number': { ru: '№', uz: '№' },
  'orders.table': { ru: 'Стол', uz: 'Stol' },
  'orders.customer': { ru: 'Клиент', uz: 'Mijoz' },
  'orders.date': { ru: 'Дата', uz: 'Sana' },
  'orders.status': { ru: 'Статус', uz: 'Holat' },
  'orders.item': { ru: 'Блюдо', uz: 'Taom' },
  'orders.qty': { ru: 'Кол-во', uz: 'Soni' },
  'orders.sum': { ru: 'Сумма', uz: 'Summa' },
  'orders.changeStatus': { ru: 'Изменить статус', uz: 'Holatni o‘zgartirish' },
  'orders.empty': { ru: 'Заказов пока нет', uz: 'Hozircha buyurtmalar yo‘q' },
  'orders.emptyHint': {
    ru: 'Заказы с сайта появятся здесь автоматически',
    uz: 'Saytdan kelgan buyurtmalar bu yerda avtomatik paydo bo‘ladi',
  },
  'orders.deleteTitle': { ru: 'Удаление заказа', uz: 'Buyurtmani o‘chirish' },
  'orders.deleteText': {
    ru: 'Заказ #{number} будет удалён безвозвратно. Продолжить?',
    uz: '#{number} buyurtma butunlay o‘chiriladi. Davom etasizmi?',
  },
  'order.status.new': { ru: 'Новый', uz: 'Yangi' },
  'order.status.confirmed': { ru: 'Подтверждён', uz: 'Tasdiqlangan' },
  'order.status.preparing': { ru: 'Готовится', uz: 'Tayyorlanmoqda' },
  'order.status.ready': { ru: 'Готов', uz: 'Tayyor' },
  'order.status.delivering': { ru: 'Доставляется', uz: 'Yetkazilmoqda' },
  'order.status.completed': { ru: 'Завершён', uz: 'Yakunlangan' },
  'order.status.cancelled': { ru: 'Отменён', uz: 'Bekor qilingan' },

  // Activity log
  'activity.newOrder': { ru: 'Новый заказ', uz: 'Yangi buyurtma' },
  'activity.orderCompleted': { ru: 'Заказ завершён', uz: 'Buyurtma yakunlandi' },
  'activity.orderCancelled': { ru: 'Заказ отменён', uz: 'Buyurtma bekor qilindi' },
  'activity.orderDeleted': { ru: 'Заказ удалён', uz: 'Buyurtma o‘chirildi' },
  'activity.reviewAdded': { ru: 'Добавлен отзыв', uz: 'Sharh qo‘shildi' },
  'activity.reviewUpdated': { ru: 'Отзыв обновлён', uz: 'Sharh yangilandi' },
  'activity.reviewDeleted': { ru: 'Отзыв удалён', uz: 'Sharh o‘chirildi' },
  'activity.productAdded': { ru: 'Добавлено блюдо', uz: 'Taom qo‘shildi' },
  'activity.productUpdated': { ru: 'Блюдо обновлено', uz: 'Taom yangilandi' },
  'activity.productDeleted': { ru: 'Блюдо удалено', uz: 'Taom o‘chirildi' },
  'activity.categoryCreated': { ru: 'Создана категория', uz: 'Kategoriya yaratildi' },
  'activity.categoryUpdated': { ru: 'Категория обновлена', uz: 'Kategoriya yangilandi' },
  'activity.categoryDeleted': { ru: 'Категория удалена', uz: 'Kategoriya o‘chirildi' },
  'activity.tableCreated': { ru: 'Добавлен стол', uz: 'Stol qo‘shildi' },
  'activity.tableUpdated': { ru: 'Стол обновлён', uz: 'Stol yangilandi' },
  'activity.tableDeleted': { ru: 'Стол удалён', uz: 'Stol o‘chirildi' },

  // Toasts
  'toast.saved': { ru: 'Изменения сохранены.', uz: 'O‘zgarishlar saqlandi.' },
  'toast.deleted': { ru: 'Успешно удалено.', uz: 'Muvaffaqiyatli o‘chirildi.' },

  // Auth
  'auth.loginTitle': { ru: 'Вход для администратора', uz: 'Administrator uchun kirish' },
  'auth.loginSubtitle': {
    ru: 'Введите пароль администратора, чтобы продолжить',
    uz: 'Davom etish uchun administrator parolini kiriting',
  },
  'auth.password': { ru: 'Пароль администратора', uz: 'Administrator paroli' },
  'auth.signIn': { ru: 'Войти', uz: 'Kirish' },
  'auth.invalidCredentials': {
    ru: 'Неверный пароль',
    uz: "Noto'g'ri parol",
  },
  'auth.backToSite': { ru: 'Вернуться на сайт', uz: 'Saytga qaytish' },

  // Admin nav
  'admin.dashboard': { ru: 'Дашборд', uz: 'Dashboard' },
  'admin.menu': { ru: 'Меню', uz: 'Menyu' },
  'admin.categories': { ru: 'Категории', uz: 'Kategoriyalar' },
  'admin.reviews': { ru: 'Отзывы', uz: 'Sharhlar' },
  'admin.about': { ru: 'О нас', uz: 'Biz haqimizda' },
  'admin.openSite': { ru: 'Открыть сайт', uz: 'Saytni ochish' },
  'admin.qr': { ru: 'QR-коды столов', uz: 'Stollar QR kodlari' },
  'admin.settings': { ru: 'Настройки', uz: 'Sozlamalar' },
  'admin.logout': { ru: 'Выйти', uz: 'Chiqish' },

  // Admin sidebar groups
  'admin.group.overview': { ru: 'Обзор', uz: 'Umumiy' },
  'admin.group.catalog': { ru: 'Каталог', uz: 'Katalog' },
  'admin.group.content': { ru: 'Контент', uz: 'Kontent' },
  'admin.group.system': { ru: 'Система', uz: 'Tizim' },

  // Dashboard
  'dash.title': { ru: 'Дашборд', uz: 'Dashboard' },
  'dash.subtitle': {
    ru: 'Обзор содержимого вашего кафе',
    uz: 'Kafeningiz tarkibi haqida umumiy ma’lumot',
  },
  'dash.totalItems': { ru: 'Блюд в меню', uz: 'Menyudagi taomlar' },
  'dash.totalCategories': { ru: 'Категорий', uz: 'Kategoriyalar' },
  'dash.availableItems': { ru: 'Доступные блюда', uz: 'Mavjud taomlar' },
  'dash.hiddenItems': { ru: 'Скрытые блюда', uz: 'Yashirilgan taomlar' },
  'dash.featuredItems': { ru: 'Рекомендуемые', uz: 'Tavsiya etilgan' },
  'dash.newItems': { ru: 'Новинки', uz: 'Yangilar' },
  'dash.quickActions': { ru: 'Быстрые действия', uz: 'Tezkor amallar' },
  'dash.addItem': { ru: 'Добавить блюдо', uz: 'Taom qo‘shish' },
  'dash.manageMenu': { ru: 'Управление меню', uz: 'Menyuni boshqarish' },
  'dash.orders': { ru: 'Заказов', uz: 'Buyurtmalar' },
  'dash.newOrders': {
    ru: '{count} новых',
    uz: '{count} ta yangi',
  },
  'dash.revenue': { ru: 'Общая выручка', uz: 'Umumiy tushum' },
  'dash.avgOrder': { ru: 'Средний чек', uz: 'O‘rtacha chek' },
  'dash.customers': { ru: 'Клиентов', uz: 'Mijozlar' },
  'dash.revenue7': { ru: 'Выручка за 7 дней', uz: '7 kunlik tushum' },
  'dash.byStatus': { ru: 'Заказы по статусам', uz: 'Holatlar bo‘yicha buyurtmalar' },
  'dash.topProducts': { ru: 'Популярные блюда', uz: 'Mashhur taomlar' },
  'dash.noData': { ru: 'Пока нет данных', uz: 'Hozircha ma’lumot yo‘q' },
  'dash.latestReviews': { ru: 'Последние отзывы', uz: 'Oxirgi sharhlar' },
  'dash.activity': { ru: 'Последние действия', uz: 'Oxirgi harakatlar' },
  'dash.noActivity': { ru: 'Действий пока не было', uz: 'Hozircha harakatlar bo‘lmagan' },

  // Admin menu page
  'menuAdmin.title': { ru: 'Управление меню', uz: 'Menyuni boshqarish' },
  'menuAdmin.addProduct': { ru: 'Добавить блюдо', uz: 'Taom qo‘shish' },
  'menuAdmin.editProduct': { ru: 'Редактирование блюда', uz: 'Taomni tahrirlash' },
  'menuAdmin.newProduct': { ru: 'Новое блюдо', uz: 'Yangi taom' },
  'menuAdmin.filterCategory': { ru: 'Все категории', uz: 'Barcha kategoriyalar' },
  'menuAdmin.filterStatus': { ru: 'Все статусы', uz: 'Barcha holatlar' },
  'menuAdmin.empty': { ru: 'Блюда не найдены', uz: 'Taomlar topilmadi' },
  'menuAdmin.notFound': {
    ru: 'Блюдо не найдено. Возможно, оно было удалено.',
    uz: 'Taom topilmadi. Ehtimol, u o‘chirilgan.',
  },
  'menuAdmin.emptyHint': {
    ru: 'Измените фильтры или добавьте первое блюдо',
    uz: 'Filtrlarni o‘zgartiring yoki birinchi taomni qo‘shing',
  },
  'menuAdmin.hide': { ru: 'Скрыть', uz: 'Yashirish' },
  'menuAdmin.show': { ru: 'Показать', uz: 'Ko‘rsatish' },
  'menuAdmin.deleteConfirmTitle': { ru: 'Удаление товара', uz: 'Mahsulotni o‘chirish' },
  'menuAdmin.deleteConfirmText': {
    ru: 'Вы действительно хотите удалить этот товар?',
    uz: 'Rostdan ham bu mahsulotni o‘chirmoqchimisiz?',
  },
  'menuAdmin.deleted': { ru: 'Товар успешно удалён', uz: 'Mahsulot muvaffaqiyatli o‘chirildi' },
  'menuAdmin.created': { ru: 'Продукт успешно добавлен.', uz: 'Mahsulot muvaffaqiyatli qo‘shildi.' },
  'menuAdmin.updated': { ru: 'Продукт успешно обновлён.', uz: 'Mahsulot muvaffaqiyatli yangilandi.' },
  'menuAdmin.shown': { ru: 'Блюдо отображается в меню.', uz: 'Taom menyuda ko‘rinadi.' },
  'menuAdmin.hiddenToast': { ru: 'Блюдо скрыто из меню.', uz: 'Taom menyudan yashirildi.' },
  'menuAdmin.sortOrder': { ru: 'Порядок', uz: 'Tartib' },
  'menuAdmin.price': { ru: 'Цена', uz: 'Narx' },
  'menuAdmin.category': { ru: 'Категория', uz: 'Kategoriya' },
  'menuAdmin.noCategory': { ru: 'Без категории', uz: 'Kategoriyasiz' },
  'menuAdmin.stock': { ru: 'Остаток', uz: 'Qoldiq' },
  'menuAdmin.outOfStock': { ru: 'Закончилось', uz: 'Tugagan' },
  'menuAdmin.sortManual': { ru: 'Сортировка: вручную', uz: 'Saralash: qo‘lda' },
  'menuAdmin.sortPriceAsc': { ru: 'Сначала дешевле', uz: 'Avval arzonlari' },
  'menuAdmin.sortPriceDesc': { ru: 'Сначала дороже', uz: 'Avval qimmatlari' },
  'menuAdmin.sortName': { ru: 'По названию', uz: 'Nomi bo‘yicha' },
  'menuAdmin.sortDiscount': { ru: 'По скидке', uz: 'Chegirma bo‘yicha' },
  'menuAdmin.sortHint': {
    ru: 'Ручное перетаскивание отключено при активной сортировке',
    uz: 'Faol saralashda qo‘lda sudrash o‘chiriladi',
  },

  // Product form
  'form.nameRu': { ru: 'Название (RU)', uz: 'Nomi (RU)' },
  'form.nameUz': { ru: 'Название (UZ)', uz: 'Nomi (UZ)' },
  'form.descRu': { ru: 'Описание (RU)', uz: 'Tavsif (RU)' },
  'form.descUz': { ru: 'Описание (UZ)', uz: 'Tavsif (UZ)' },
  'form.price': { ru: 'Цена (сум)', uz: 'Narx (so‘m)' },
  'form.category': { ru: 'Категория', uz: 'Kategoriya' },
  'form.selectCategory': { ru: 'Выберите категорию', uz: 'Kategoriyani tanlang' },
  'form.weight': { ru: 'Вес / Объём', uz: 'Vazn / Hajm' },
  'form.weightHint': { ru: 'Например: 350 г или 400 мл', uz: 'Masalan: 350 g yoki 400 ml' },
  'form.image': { ru: 'Изображение', uz: 'Rasm' },
  'form.imageHint': {
    ru: 'JPG или PNG, до 5 МБ',
    uz: 'JPG yoki PNG, 5 MB gacha',
  },
  'form.replaceImage': { ru: 'Заменить изображение', uz: 'Rasmni almashtirish' },
  'form.available': { ru: 'Доступно в меню', uz: 'Menyuda mavjud' },
  'form.featured': { ru: 'Рекомендуемое', uz: 'Tavsiya etilgan' },
  'form.isNew': { ru: 'Новинка', uz: 'Yangi mahsulot' },
  'form.tags': { ru: 'Метки блюда', uz: 'Taom belgilari' },
  'form.sortOrder': { ru: 'Порядок отображения', uz: 'Ko‘rsatish tartibi' },
  'form.gallery': { ru: 'Фотографии блюда', uz: 'Taom rasmlari' },
  'form.galleryHint': {
    ru: 'Первая фотография — главная',
    uz: 'Birinchi rasm — asosiy',
  },
  'form.galleryFull': {
    ru: 'Максимум {max} фотографий',
    uz: 'Maksimum {max} ta rasm',
  },
  'form.mainPhoto': { ru: 'Главная', uz: 'Asosiy' },
  'form.makeMain': { ru: 'Сделать главной', uz: 'Asosiy qilish' },
  'form.addPhotos': { ru: 'Добавить фото', uz: 'Rasm qo‘shish' },
  'form.stock': { ru: 'Остаток на складе', uz: 'Ombordagi qoldiq' },
  'form.stockHint': {
    ru: 'Оставьте пустым, чтобы не отслеживать остаток',
    uz: 'Qoldiqni kuzatmaslik uchun bo‘sh qoldiring',
  },
  'form.discount': { ru: 'Скидка, %', uz: 'Chegirma, %' },
  'form.discountHint': {
    ru: 'От 0 до 90. 0 — без скидки',
    uz: '0 dan 90 gacha. 0 — chegirmasiz',
  },
  'form.uploading': { ru: 'Загрузка изображения…', uz: 'Rasm yuklanmoqda…' },
  'form.validation.required': { ru: 'Обязательное поле', uz: 'Majburiy maydon' },
  'form.validation.url': { ru: 'Введите корректную ссылку', uz: 'To‘g‘ri havola kiriting' },
  'form.validation.nameShort': {
    ru: 'Минимум 2 символа',
    uz: 'Kamida 2 belgi',
  },
  'form.validation.priceNumber': {
    ru: 'Цена должна быть числом больше нуля',
    uz: 'Narx noldan katta son bo‘lishi kerak',
  },
  'form.validation.imageSize': {
    ru: 'Файл слишком большой (максимум 5 МБ)',
    uz: 'Fayl juda katta (maksimum 5 MB)',
  },
  'form.validation.imageType': {
    ru: 'Поддерживаются только JPG и PNG',
    uz: 'Faqat JPG va PNG qo‘llab-quvvatlanadi',
  },

  // Categories admin
  'catAdmin.title': { ru: 'Категории', uz: 'Kategoriyalar' },
  'catAdmin.subtitle': {
    ru: 'Управляйте разделами меню кафе',
    uz: 'Kafe menyusi bo‘limlarini boshqaring',
  },
  'catAdmin.add': { ru: 'Добавить категорию', uz: 'Kategoriya qo‘shish' },
  'catAdmin.edit': { ru: 'Редактировать категорию', uz: 'Kategoriyani tahrirlash' },
  'catAdmin.new': { ru: 'Новая категория', uz: 'Yangi kategoriya' },
  'catAdmin.itemsCount': { ru: 'блюд', uz: 'taom' },
  'catAdmin.empty': { ru: 'Категорий пока нет', uz: 'Hozircha kategoriyalar yo‘q' },
  'catAdmin.deleteBlocked': {
    ru: 'Сначала переместите или удалите блюда этой категории',
    uz: 'Avval bu kategoriya taomlarini ko‘chiring yoki o‘chiring',
  },
  'catAdmin.deleteConfirmTitle': { ru: 'Удаление категории', uz: 'Kategoriyani o‘chirish' },
  'catAdmin.deleteConfirmText': {
    ru: 'Вы уверены, что хотите удалить эту категорию?',
    uz: 'Bu kategoriyani o‘chirishga ishonchingiz komilmi?',
  },
  'catAdmin.created': { ru: 'Категория создана.', uz: 'Kategoriya yaratildi.' },
  'catAdmin.updated': { ru: 'Категория обновлена.', uz: 'Kategoriya yangilandi.' },
  'catAdmin.deleted': { ru: 'Категория удалена.', uz: 'Kategoriya o‘chirildi.' },
  'catAdmin.hiddenCategory': { ru: 'Скрыть категорию с сайта', uz: 'Kategoriyani saytdan yashirish' },

  // About admin
  'aboutAdmin.title': { ru: 'Редактирование «О нас»', uz: '«Biz haqimizda» tahrirlash' },
  'aboutAdmin.subtitle': {
    ru: 'Этот текст отображается в секции «О нас» на сайте',
    uz: 'Bu matn saytdagi «Biz haqimizda» bo‘limida ko‘rinadi',
  },
  'aboutAdmin.contentRu': { ru: 'Текст (RU)', uz: 'Matn (RU)' },
  'aboutAdmin.contentUz': { ru: 'Текст (UZ)', uz: 'Matn (UZ)' },
  'aboutAdmin.saved': { ru: 'Изменения сохранены.', uz: 'O‘zgarishlar saqlandi.' },

  // Reviews admin
  'reviews.add': { ru: 'Добавить отзыв', uz: 'Sharh qo‘shish' },
  'reviews.search': { ru: 'Поиск по имени или тексту…', uz: 'Ism yoki matn bo‘yicha qidirish…' },
  'reviews.hidden': { ru: 'Скрыт', uz: 'Yashirilgan' },
  'reviews.hide': { ru: 'Скрыть отзыв', uz: 'Sharhni yashirish' },
  'reviews.show': { ru: 'Опубликовать', uz: 'E’lon qilish' },
  'reviews.emptyAdmin': { ru: 'Отзывов пока нет', uz: 'Hozircha sharhlar yo‘q' },
  'reviews.emptyHint': {
    ru: 'Добавьте первый отзыв о вашем заведении',
    uz: 'Muassasangiz haqida birinchi sharhni qo‘shing',
  },
  'reviews.filterStatus': { ru: 'Все отзывы', uz: 'Barcha sharhlar' },
  'reviews.filterVisible': { ru: 'Опубликованные', uz: 'E’lon qilinganlar' },
  'reviews.filterHidden': { ru: 'Скрытые', uz: 'Yashirilganlar' },
  'reviews.dish': { ru: 'Блюдо', uz: 'Taom' },
  'reviews.general': { ru: 'О заведении', uz: 'Muassasa haqida' },
  'reviews.createTitle': { ru: 'Новый отзыв', uz: 'Yangi sharh' },
  'reviews.editTitle': { ru: 'Редактирование отзыва', uz: 'Sharhni tahrirlash' },
  'reviews.deleteTitle': { ru: 'Удаление отзыва', uz: 'Sharhni o‘chirish' },
  'reviews.deleteText': {
    ru: 'Отзыв от «{name}» будет удалён безвозвратно.',
    uz: '«{name}» sharhi butunlay o‘chiriladi.',
  },
  'reviews.form.author': { ru: 'Имя автора', uz: 'Muallif ismi' },
  'reviews.form.rating': { ru: 'Оценка', uz: 'Baho' },
  'reviews.form.textRu': { ru: 'Текст отзыва (RU)', uz: 'Sharh matni (RU)' },
  'reviews.form.textUz': { ru: 'Текст отзыва (UZ)', uz: 'Sharh matni (UZ)' },
  'reviews.form.avatar': { ru: 'Аватар (URL)', uz: 'Avatar (URL)' },
  'reviews.form.visible': { ru: 'Показывать на сайте', uz: 'Saytda ko‘rsatish' },
  'reviews.form.invalid': {
    ru: 'Укажите имя автора и текст отзыва хотя бы на одном языке',
    uz: 'Muallif ismi va kamida bitta tilda sharh matnini kiriting',
  },

  // QR tables page
  'qr.title': { ru: 'QR-коды столов', uz: 'Stollar QR kodlari' },
  'qr.subtitle': {
    ru: 'Гость сканирует QR-код со своего стола — меню открывается сразу с номером стола, и заказ автоматически уходит туда.',
    uz: 'Mehmon stol ustidagi QR kodni skanerlaydi — menyu stol raqami bilan ochiladi va buyurtma avtomatik shu stolga yuboriladi.',
  },
  'qr.addTable': { ru: 'Добавить стол', uz: 'Stol qo‘shish' },
  'qr.newTableTitle': { ru: 'Новый стол', uz: 'Yangi stol' },
  'qr.editTableTitle': { ru: 'Изменить номер стола', uz: 'Stol raqamini o‘zgartirish' },
  'qr.tableNumber': { ru: 'Номер стола', uz: 'Stol raqami' },
  'qr.tableNumberInvalid': {
    ru: 'Введите номер от 1 до 999',
    uz: '1 dan 999 gacha bo‘lgan raqamni kiriting',
  },
  'qr.tableNumberTaken': { ru: 'Стол с таким номером уже существует', uz: 'Bu raqamli stol allaqachon mavjud' },
  'qr.tableCreated': { ru: 'Стол №{number} добавлен', uz: '{number}-stol qo‘shildi' },
  'qr.tableUpdated': { ru: 'Номер стола изменён', uz: 'Stol raqami o‘zgartirildi' },
  'qr.tableDeleted': { ru: 'Стол №{number} удалён', uz: '{number}-stol o‘chirildi' },
  'qr.deleteTitle': { ru: 'Удаление стола', uz: 'Stolni o‘chirish' },
  'qr.deleteText': {
    ru: 'Стол №{number} и его QR-код будут удалены. Гости больше не смогут заказать через этот код. Продолжить?',
    uz: '{number}-stol va uning QR kodi o‘chiriladi. Mehmonlar bu kod orqali buyurtma bera olmaydi. Davom etasizmi?',
  },
  'qr.recreate': { ru: 'Пересоздать', uz: 'Qayta yaratish' },
  'qr.recreated': { ru: 'QR-код пересоздан', uz: 'QR kod qayta yaratildi' },
  'qr.downloadPng': { ru: 'Скачать PNG', uz: 'PNG yuklab olish' },
  'qr.open': { ru: 'Открыть', uz: 'Ochish' },
  'qr.print': { ru: 'Печать', uz: 'Chop etish' },
  'qr.copyLink': { ru: 'Копировать ссылку', uz: 'Havolani nusxalash' },
  'qr.linkCopied': { ru: 'Ссылка скопирована.', uz: 'Havola nusxalandi.' },
  'qr.empty': { ru: 'Столов пока нет', uz: 'Hozircha stollar yo‘q' },
  'qr.emptyHint': {
    ru: 'Добавьте первый стол — система сразу создаст для него QR-код',
    uz: 'Birinchi stolni qo‘shing — tizim darhol un uchun QR kod yaratadi',
  },
  'qr.scanHint': {
    ru: 'Наведите камеру телефона, чтобы открыть меню',
    uz: 'Menyuni ochish uchun telefon kamerasini yo‘naltiring',
  },
  'qr.error': {
    ru: 'Не удалось создать QR-код. Попробуйте пересоздать его.',
    uz: 'QR kod yaratib bo‘lmadi. Qayta yaratab ko‘ring.',
  },
  'qr.generating': { ru: 'Создание QR-кода…', uz: 'QR kod yaratilmoqda…' },
  'qr.menuUrl': { ru: 'Ссылка на меню', uz: 'Menyu havolasi' },

  // Settings
  'settings.title': { ru: 'Настройки', uz: 'Sozlamalar' },
  'settings.subtitle': {
    ru: 'Общие данные кафе, контакты и социальные сети',
    uz: 'Kafening umumiy ma’lumotlari, aloqa va ijtimoiy tarmoqlar',
  },
  'settings.cafeName': { ru: 'Название кафе', uz: 'Kafe nomi' },
  'settings.tagline': { ru: 'Подпись', uz: 'Shior' },
  'settings.description': { ru: 'Описание кафе', uz: 'Kafe tavsifi' },
  'settings.descriptionHint': {
    ru: 'Короткий текст о заведении для страницы «О нас» и футера',
    uz: '«Biz haqimizda» sahifasi va futer uchun qisqa matn',
  },
  'settings.phone': { ru: 'Телефон', uz: 'Telefon' },
  'settings.address': { ru: 'Адрес', uz: 'Manzil' },
  'settings.hours': { ru: 'Часы работы', uz: 'Ish vaqti' },
  'settings.telegram': { ru: 'Ссылка Telegram', uz: 'Telegram havolasi' },
  'settings.instagram': { ru: 'Ссылка Instagram', uz: 'Instagram havolasi' },
  'settings.logo': { ru: 'Логотип', uz: 'Logotip' },
  'settings.defaultLang': { ru: 'Язык по умолчанию', uz: 'Standart til' },
  'settings.langRu': { ru: 'Русский', uz: 'Rus tili' },
  'settings.langUz': { ru: 'Узбекский', uz: 'O‘zbek tili' },
  'settings.saved': { ru: 'Настройки сохранены.', uz: 'Sozlamalar saqlandi.' },
} as const;

export function translate(
  key: TranslationKey,
  lang: Language,
  params?: Record<string, string | number>,
): string {
  const entry = translations[key];
  let text: string = entry[lang] ?? entry.ru;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

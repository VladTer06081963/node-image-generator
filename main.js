import express from 'express';
import config from 'config';
import { engine } from 'express-handlebars';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: config.get('OPENAI_KEY'), // Передаем API-ключ для OpenAI
});

const PORT = config.get('PORT');
const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (_, res) => {
  res.render('index');
});

app.post('/', async (req, res) => {
  const prompt = req.body.prompt;
  const size = req.body.size ?? '512x512';
  const number = req.body.number ?? 1;

  // Определение модели на основе размера изображения
  let model = 'dall-e-2';
  if (size === '1024x1024') {
    model = 'dall-e-3'; // Используем 'dall-e-3' для больших разрешений
  }

  try {
    // Генерация изображения с выбором модели
    const response = await openai.images.generate({
      prompt,
      n: Number(number),
      size,
      model, // Передаем выбранную модель
    });

    // console.log(response.data);

    res.render('index', {
      images: response.data,
    });
  } catch (e) {
    console.error(e.message);
    res.render('index', {
      error: e.message,
    });
  }
});

app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));

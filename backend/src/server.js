import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/', (req, res) => {
    res.json('Express funcionando');
});

app.listen(PORT);

import exress from 'express'
import cors from 'cors';
import dot from 'dotenv'
import { getAgent } from './chat';

dot.config();

const app = exress();
app.use(cors());
app.use(exress.json());
app.use(exress.urlencoded({ extended: true }));


app.get('/ping', (_, res) => {
    res.send('Hello there!')
});

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

let agent: UnwrapPromise<ReturnType<typeof getAgent>>;

app.post('/chat', async (req, res) => {
    const { input } = req.body;

    const result = await agent.call({
        input: input as string,
    });

    res.send(result);
})


const setup = async () => {
    agent = await getAgent();
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Example app listening at http://localhost:${process.env.PORT || 3000}`)
    })
}

setup();

module.exports = app;
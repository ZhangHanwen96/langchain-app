
import exress from 'express'
import cors from 'cors';
import dot from 'dotenv'
import { getAgent } from './chat';
import { OpenAI } from 'langchain';

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


// const model = new OpenAI({ temperature: 0.9 });
app.post('/chat', async (req, res) => {
    const { input } = req.body;
    console.log('query: ', input)

    console.log(JSON.stringify(agent));

    const result = await agent?.call(
       {input}
      );

    res.status(200);
    res.json(result);
})

const setup = async () => {
    
    agent = await getAgent();
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Example app listening at http://localhost:${process.env.PORT || 3000}`)
    })
}

setup();

export default app;
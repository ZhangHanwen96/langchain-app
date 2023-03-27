
import exress from 'express'
import cors from 'cors';
import dot from 'dotenv'
import { getAgent, getLlmBashChain } from './chat';
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

let agent: UnwrapPromise<ReturnType<typeof getLlmBashChain>>;


// const model = new OpenAI({ temperature: 0.9 });
app.post('/chat', async (req, res) => {
    if(!agent) {
        // agent = await getAgent();
        agent = getLlmBashChain();
    }
    const result = await agent.call({question: `Please write a bash script that prints 'Hello World' to the console.`})
    const { input } = req.body;
    console.log('query: ', input)

    // const result = await agent?.call(
    //    {input}
    //   );

    res.status(200);
    res.json(result);
})

const setup = async () => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Example app listening at http://localhost:${process.env.PORT || 3000}`)
    })
}

setup();

export default app;
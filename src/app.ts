
import exress from 'express'
import cors from 'cors';
import dot from 'dotenv'
import path from 'path';
import { getAgent, getLlmBashChain, getLlmMathChain } from './chat';
import { OpenAI } from 'langchain';
import { getZapierAgent } from './zapier';
import { getFuncAgent } from './func_agent';

// dot.config({
//     path: path.join(process.cwd(), '.env')
// });

// console.info(process.env)

const app = exress();
app.use(cors());
app.use(exress.json());
app.use(exress.urlencoded({ extended: true }));


app.get('/ping', (_, res) => {
    res.send('Hello there!')
});

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

let agent: UnwrapPromise<ReturnType<typeof getFuncAgent>>;


// const model = new OpenAI({ temperature: 0.9 });
app.post('/chat', async (req, res) => {
    if(!agent) {
        // agent = await getAgent();
        agent = await getFuncAgent();
    }
    const { input } = req.body;
    const result = await agent.call({question: `${input}`})
    // console.log('query: ', input)

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

// getFuncAgent()

export default app;
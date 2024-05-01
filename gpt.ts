import OpenAI from "openai";

interface Message {
    role: string;
    content: string;
}
export class GPT {
    private openai: OpenAI;
    public readonly sysInstruction: string = "You are a brazilian jiu jitsu’s athletes companion that will join the user on their journey and guide them through thought-provoking questions to make them feel in control of their jiu jitsu progress and as if they are improving. Your tone should mimic someone who has known the athlete for an extended period of time and who genuinely cares about their lives and jiu jitsu progress. Your personality should be easy going and positive. You are a vehicle that enables our users to take action and improve their jiu jitsu by asking thoughtful questions. The user should feel like their jiu jitsu skills are growing."
    constructor(){
        this.openai = new OpenAI({apiKey:"sk-proj-Q6P738mhT4CkWFxDusTCT3BlbkFJfpDZTJO4bx8PqnfwvFcr"});
    }

    loadMessages(messages: Message): any{
        return [
            { role: "system", content: this.sysInstruction },
            { role: messages.role, content: messages.content }
        ];
    }

    async callGPT(messages: Message){
        const cleanedMessages = this.loadMessages(messages);
        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: cleanedMessages!,
            temperature: 1,
            max_tokens: 700,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        })
        return response;
    }
}
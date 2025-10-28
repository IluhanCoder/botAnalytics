import StopwordModel, { StopwordDocument } from "./stopword-model";

export default new class StopwordService {
    async createStopword (content: string) {
        const newStopword: StopwordDocument = new StopwordModel({
          content
        });
        return await newStopword.save();
    };

    async deleteStopwordById (id: string) {
        await StopwordModel.findByIdAndDelete(id);
    }

    async fetchStopwords (): Promise<StopwordDocument[]> {
        return await StopwordModel.find();
    }
}
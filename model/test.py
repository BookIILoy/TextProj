import pickle

model = pickle.load(open("model.pkl", "rb"))
cv = pickle.load(open("vectorizer.pkl", "rb"))

def main():
    def prediction(text):
        text = cv.transform([text]).toarray()
        predict = model.predict(text)[0]
        return predict

    input_text = input("Text :")
    print("From : " + input_text,"\n Result : " + prediction(input_text))
    

main()




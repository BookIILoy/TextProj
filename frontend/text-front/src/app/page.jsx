'use client'
import Image from "next/image";
import { useState } from "react";

function extractUsername(input) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|t\.co|twitter\.com\/#!\/)?(?:\w+\/)?@?([A-Za-z0-9_]{1,15})\b/g;
    const matches = input.match(regex);
    if (matches) {
        return matches.map(match => match.replace(/^.*\/(@)?/, '')); // Extract only the username
    } else {
        return [];
    }
}

export default function Home() {
  const [input, setInput] = useState("");
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(0);
  const [fail, setFail] = useState(false);
  const options = ["url", "comment"];
  const [option, setOption] = useState("url");
  const handleSend = async() => {
    if(fail){
      setFail(false);
    }
    setResult(0);
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    if(option == "comment") {
      const raw = JSON.stringify({
        "input": input
      });
  
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
       await fetch("http://localhost:8000/api/pred/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setTimeout(() => {
          setLoading(false);
          setResult(result);
        }, 500);
      })
      .catch((error) => console.error(error));
    } else {
      const username = extractUsername(input);
      const raw = JSON.stringify({
        "username": username[username.length-1]
      });
  
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
      await fetch("http://localhost:8000/api/pred/user/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setLoading(false);
        setResult(result);
        if(result.success == 0){
          setFail(true);
        }
        console.log(result);
      })
      .catch((error) => console.error(error));
    }
  }

  return (
    <main className="flex min-h-screen justify-center w-full items-center">
      <div className="flex flex-col">
        <h1 className="font-bold my-4">Toxic Comment Detector, Type : 
          <button className="text-white w-[7rem] bg-black border-4 
            border-white border-solid rounded-md absolute" onClick={(e) => setActive(!active)}>
            {option}
            {active && (
              <div>
                {options.map((item) => (
                  <p className="" key={item} onClick={(e) => {setOption(item); setActive(!active); setInput(""); setResult(0);}}>{item}</p>
                ))}
              </div>
            )}
          </button>
        </h1>
        <div className=" border-black border-4 border-solid rounded-md">
           <input 
             type="text" 
             value={input} 
             placeholder={option} 
             onChange={(e) => setInput(e.target.value)}
             className="text-black outline-none h-10 w-[40rem] px-5"
           />
           <button 
             className="text-white bg-black py-4 px-4 border-4 border-white border-solid rounded-md hover:bg-green-700 duration-300"
             onClick={handleSend}
           >
             Send
           </button>
        </div>
        {loading && (
          <div class="border border-blue-300 shadow rounded-md p-4 w-full mx-auto my-5">
          <div class="animate-pulse flex space-x-4">
            <div class="rounded-full bg-slate-200 h-10 w-10"></div>
            <div class="flex-1 space-y-6 py-1">
              <div class="h-2 bg-slate-200 rounded"></div>
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-4">
                  <div class="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div class="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div class="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        )}
        { option == "comment" ? 
            ( result !== 0 && 
                <div className="my-4">
                  <p className="font-bold text-xl w-[40rem]"> From : <span className="font-normal">{result.From}</span></p>
                  <p className="font-bold text-xl"> Result : <span className="font-normal">{result.Result}</span></p>
                </div>
            ) : ( result !== 0 &&
              ( fail ? 
                <div className="my-4">
                  <p className="font-bold text-xl">Failed to fetching tweets please try again...</p>
                </div>
                :(
                <div className="my-4">
                <p className="font-bold"> From User : <span className="font-normal">{result.From}</span></p>
                <p className="font-bold ">No Hate and Offensive detected : <span className="font-normal">{result.no_hate_offen}</span></p>
                <p className="font-bold ">Offensive language detected : <span className="font-normal">{result.offensive}</span></p>
                <p className="font-bold">Hate speech detected : <span className="font-normal">{result.hate}</span></p>
                <div className="flex flex-col justify-center">
                  <img src = {`data:image/png;base64,${result.image_base64}`} alt="Visualization" className="border-4 border-solid border-black rounded-md my-2" />
                  <p className="text-xs">Count = Tweets, 0 = no hate and offensive, 1 = offensive, 2 = hate speech</p>
                  <img src = {`data:image/png;base64,${result.wordcloud}`} alt="Wordcloud" className=" w-auto h-[32rem] border-4 border-solid border-black rounded-md my-2" />
                  <p className="text-xs">Wordcloud Visualized</p>
                  <img src = {`data:image/png;base64,${result.mostword}`} alt="MostWordVisual" className="border-4 border-solid border-black rounded-md my-2" />
                  <p className="text-xs">Most use word in this user</p>
                </div>
              </div>
              ))
            )
        }
      </div>
    </main>
  );
}
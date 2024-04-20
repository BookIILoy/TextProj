'use client'
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(0);
  const options = ["url", "comment"];
  const [option, setOption] = useState("url");

  const handleSend = () => {
    setResult(0);
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "input": input
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

     fetch("http://localhost:8000/api/pred/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        setTimeout(() => {
          setLoading(false);
          setResult(result);
        }, 500);
      })
      .catch((error) => console.error(error));
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
                  <p className="" key={item} onClick={(e) => {setOption(item); setActive(!active)}}>{item}</p>
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
        { result !== 0 && 
        <div className="my-4">
              <p className="font-bold text-xl w-[40rem]"> From : <span className="font-normal">{result.From}</span></p>
              <p className="font-bold text-xl"> Result : <span className="font-normal">{result.Result}</span></p>
          </div>}
      </div>
    </main>
  );
}
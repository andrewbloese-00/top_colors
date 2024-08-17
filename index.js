const fs = require("fs")
const {PNG} = require("pngjs");


exports.loadPNG = (path) => new Promise((resolve)=>{
	if(!fs.existsSync(path)) return resolve({
		error: "File not found"
	})

	const stream = fs.createReadStream(path);
	const png = new PNG({filterType:4})
	stream.pipe(png)
		.on("parsed", function(){
			resolve({png:this})
		})
		.on("error",function(err){
			resolve({error: "Parse Error!"})
		})
})


exports.getTopNColors = (png,n) => {

	const freq = {}

	for(let y = 0; y < png.height; y++){
		for(let x = 0; x < png.width; x++){
			const i  = (png.width*y+x)<<2
			const rgba = [png.data[i],png.data[i+1],png.data[i+2],png.data[i+3]].join(",")
			if(!freq[rgba]) freq[rgba] = 1
			else freq[rgba]++
		}
	}

	const frequencyEntries = []
	for(const rgba in freq)	frequencyEntries.push([rgba,freq[rgba]])
	
	frequencyEntries.sort((a,b)=>b[1]-a[1])
	const N = Math.min(frequencyEntries.length, n)
	return frequencyEntries.slice(0,N).map(([rgba,n])=>{
		let [r,g,b] = rgba.split(",").map(Number)
		const percent = ((n/(png.width*png.height))*100).toFixed(2)
		return { r,g,b , percent }
	})
}

exports.cli = async () => {
	const pathToPng = process.argv[2], n = parseInt(process.argv[3],10)
	if(!pathToPng || !n){
		console.error("[FATAL] no path to img provided")
		process.exit(1)
	}
	const { png, error } = await this.loadPNG(pathToPng)
	if(png){
		const topN = this.getTopNColors(png,n)
		for(let i = 0; i < topN.length; i++){
			const { r,g,b, percent} = topN[i]
			console.log(`${i+1}) rgb(${r},${g},${b}) -> ${percent}%`)

		}

	} else { 
		console.error(error)
	}
}


import { readFileSync } from "node:fs"

const file = readFileSync("data/Madeira-Moodle-1.1.csv", "utf-8")

console.log(file.split("\n").length)

const obj = {
	abc: 5,
	foo: () => {
		console.log("foo")
	},
}
obj.foo()
obj.abc = 1

interface Data {
	objectId: Map<string, number>
	par_id?: number
	par_num: number
	shape_length: number
	ola: {
		adeus: string
	}
}

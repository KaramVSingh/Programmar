import { Input } from './input/input'
import { Cfg } from './cfg/cfg'

function handleRequest(input: Input) {
    Input.validate(input)
    const cfg = Cfg.fromInput(input)
}
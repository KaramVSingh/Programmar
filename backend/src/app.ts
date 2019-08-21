import { Cfg, validate } from './cfg/cfg'

function handleRequest(input: Object) {
    let cfg: Cfg = new Cfg(input)
    validate(cfg)
}
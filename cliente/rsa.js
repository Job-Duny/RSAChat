// import bigInt from "big-integer";

class RSA {
    static randomPrime(bits) {
        const min = bigInt(2).pow(bits - 1);
        const max = bigInt(2).pow(bits).prev();

        while (true) {
            let p = bigInt.randBetween(min, max);
            if (p.isProbablePrime(256)) {
                return p;
            }
        }    
    }

    static generate(keysize){
        const e = bigInt(65537);
        let p, q, totient;

        do{
            p = this.randomPrime(keysize / 2 );
            q = this.randomPrime(keysize / 2 );
            totient = bigInt.lcm(p.prev(), q.prev());
        } while (bigInt.gcd(e, totient).notEquals(1) || p.minus(q).abs().shiftRight(keysize / 2 - 100).isZero());
        
        return {
            e,
            n: p.multiply(q),
            d: e.modInv(totient)
        }
    }

    static encrypt(enodeMess, e, n){
        return bigInt(enodeMess).modPow(e, n);
    }

    static decrypt(encryptedMess, d, n){
        return bigInt(encryptedMess).modPow(d, n);
    }

    static encode(str){
        const code = str.split('').map(c => c.charCodeAt()).join('');
        return bigInt(code);
    }

    static decode(code){
        const stringified = code.toString();
        let string = '';

        for (let i = 0; i < stringified.length; i += 2) {
            let num = Number(stringified.substr(i, 2));

            if (num <= 30) {
                string += String.fromCharCode(Number(stringified.substr(i, 3)));
                i++;
            } else {
                string += String.fromCharCode(num);
            }    
        }

        return string;
    }
}
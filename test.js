var parseInt = function(str, radix) {
	var result = 0;
	radix = radix == null ? 10 : Number(radix);
	if (radix !== radix) throw new Error('radix is not right');
	if (radix > 36 || radix < 2) throw new Error('radix not in range');
	var cor_str = String(str);   // 最好不要用str + ''转型，因为对于Symbol原始值会直接调用ToString抽象操作
	var match_num_str = /^\s*(\d*)/.exec(cor_str)[1];
	var num_arr = match_num_str.split('').reverse();
	num_arr.forEach(function(elem, index, arr) {
		result += Math.pow(radix, index) * Number(elem);
	});
	return result;
}



console.log(parseInt('abc'));
console.log(parseInt('   0124'));
console.log(parseInt('123abc'));
console.log(parseInt('123', 8));
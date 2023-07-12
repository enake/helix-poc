export default class initZuoraNL {
	static coupon = 'SummerSale2023';

	static monthlyProducts = ["psm", "pspm", "vpn-monthly", "passm", "pass_spm", "dipm"]

	// this products come with device_no set differently from the init-selector api where they are set to 1
	static wrongDeviceNumber = ["bms", "mobile", "ios", "mobileios", "psm", "passm"]

	static productId = {
		av: "com.bitdefender.cl.av",
		is: "com.bitdefender.cl.is",
		tsmd: "com.bitdefender.cl.tsmd",
		fp: "com.bitdefender.fp",
		ps: "com.bitdefender.premiumsecurity",
		psm: "com.bitdefender.premiumsecurity",
		psp: "com.bitdefender.premiumsecurityplus",
		pspm: "com.bitdefender.premiumsecurityplus",
		soho: "com.bitdefender.soho",
		mac: "com.bitdefender.avformac",
		vpn: "com.bitdefender.vpn", "vpn-monthly": "com.bitdefender.vpn",
		pass: "com.bitdefender.passwordmanager",
		passm: "com.bitdefender.passwordmanager",
		pass_sp: "com.bitdefender.passwordmanager",
		pass_spm: "com.bitdefender.passwordmanager",
		bms: "com.bitdefender.bms",
		mobile: "com.bitdefender.bms",
		ios: "com.bitdefender.iosprotection",
		mobileios: "com.bitdefender.iosprotection",
		dip: "com.bitdefender.dataprivacy",
		dipm: "com.bitdefender.dataprivacy"
	}

	static names = {
		pass: "Bitdefender Password Manager",
		pass_sp: "Bitdefender Password Manager Shared Plan",
		passm: "Bitdefender Password Manager",
		pass_spm: "Bitdefender Password Manager Shared Plan"
	}

	static getKey() {
		const hostname = window.location.hostname;
    	return 'bb22f980-fa19-11ed-b443-87a99951e6d5';
	}

	static config() {
		return {
			key: this.getKey(),
			country: 'NL',
			language: 'nl_NL',
			debug: false,
			request_timeout: 15000, //default value if not set 3500
			default_scenario: 'www.checkout.v1',
			disable_auto_generated_new_session: false,
			return_url: document.referrer ? document.referrer : window.location.href,
			central: true
		};
	}

    static getProductsVariationsPrice(productsList, campaignId) {
		for (let i = 0; i < productsList.length; i++) {
			const prod = productsList[i].split('/');
			const id = prod[0];
			const devices_no = prod[1];
			const years_no = prod[2];
			return new Promise((resolve, reject) => {
				BitCheckoutSDK.getProductVariationsPrice({ bundle: this.productId[id], campaign: campaignId }, (payload) => {
					if (!payload || payload.length === 0) {
						reject();
					}

					payload = payload[payload.length - 1];
					/**
					 * this rules splits one product into multiple products
					 * for example com.bitdefender.passwordmanager maps 2 products
					 * Password Manager and Password Manager Shared Plan
					 */
					if (this.names[id]) {
						payload = payload.filter(product => product.name === this.names[id])
					}

					const pricing = {};
					payload.pricing.map(item => {
						if (item.devices_no === Number(devices_no)) {
							pricing.total = item.devices_no;
							pricing.discount = item.discount;
							pricing.price = item.price;
						}
					});

					window.StoreProducts.products[id] = {
						selected_users: devices_no,
						selected_years: years_no,
						selected_variation: {
							product_id: devices_no,
							region_id: 22,
							variation_id: 0,
							platform_id: 16,
							platform_product_id: 0,
							price: pricing.price,
							currency_id: 0,
							in_selector: 0,
							active_platform: 0,
							variation_active: 0,
							avangate_variation_prefix: '',
							variation: {
								variation_id: 0,
								variation_name: `${devices_no}u-${years_no}y`,
								dimension_id: 0,
								dimension_value: 0,
								years: years_no
							},
							currency_label: '€',
							currency_iso: 'EUR',
							discount: {
								discounted_price: pricing.price,
								discount_value: pricing.discount,
								discount_type: 0
							},
							promotion: campaignId,
							promotion_functions: ''
						},
						buy_link: "https://www.bitdefender.com/site/Store/buy/av/3/1",
						config: {
							product_id: id,
							full_price_class: `oldprice-${id}`,
							discounted_price_class: `newprice-${id}`,
							price_class: `price-${id}`,
							buy_class: `buylink-${id}`,
							selected_users: devices_no,
							selected_years: years_no,
							users_class: `users_${id}_fake`,
							years_class: `years_${id}_fake`,
							extra_params: {},
							onSelectorLoad: null,
							initCount: 1,
							doAjax: false,
							onChangeUsers: null,
							onChangeYears: null
						}
					}

					/*window.StoreProducts.product[id] = {
						product_alias: id,
						product_id: id,
						product_name: payload.name,
					}

					const devicesObj = {
						currency_iso: 'EUR',
						currency_label: '€',
						product_id: id,
						platform_product_id: id,
						promotion: campaignId,
						region_id: 22,
						platform_id: 16,
						price: pricing.price,
						variation: {
							variation_name: `${devices_no}u-${years_no}y`,
							years: years_no,
							billing_period: payload.billing_period,
							payment_period: payload.payment_period
						}
					}

					if (pricing.discount > 0) {
						devicesObj['discount'] = {
							discounted_price: pricing.total,
							discount_value: pricing.discount,
						}
					}

					window.StoreProducts.product[id].variation = devicesObj*/
					console.log('here', window.StoreProducts)
					resolve(window.StoreProducts);
				}); // BitCheckoutSDK.getProductVariationsPrice
			});	// Promise
		}; // for
		

        //return window.StoreProducts
	}

	static getProductVariationPrice(product, campaignId = this.coupon) {
		const prod = product.split('/');
		const id = prod[0];
		const devices_no = prod[1];
		const years_no = prod[2];
		return new Promise((resolve, reject) => {
			BitCheckoutSDK.getProductVariationsPrice({ bundle: this.productId[id], campaign: campaignId }, (payload) => {
				if (!payload || payload.length === 0) {
					reject();
				}

				payload = payload[payload.length - 1];
				// console.log(payload)
				/**
				 * this rules splits one product into multiple products
				 * for example com.bitdefender.passwordmanager maps 2 products
				 * Password Manager and Password Manager Shared Plan
				 */
				if (this.names[id]) {
					payload = payload.filter(product => product.name === this.names[id])
				}

				const pricing = {};
				payload.pricing.map(item => {
					if (item.devices_no === Number(devices_no)) {
						pricing.total = item.price;
						pricing.discount = item.discount;
						pricing.price = item.total;
					}
				});

				// buylink:
				const zuoraCart = new URL('https://checkout.bitdefender.com/index.html:step=cart?theme=light');
				zuoraCart.searchParams.set('product_id', this.productId[id]);
				zuoraCart.searchParams.set('session_id', BitCheckoutSDK.getSessionId());
				zuoraCart.searchParams.set('payment_period', this.monthlyProducts[id] ? `${devices_no}d1m` : `${devices_no}d${years_no}y`);
				if (id === 'vpn') {
					zuoraCart.searchParams.set('bundle_id', this.productId);
					zuoraCart.searchParams.set('bundle_payment_period', '1d1y');
				}
 
				// console.log('pricing', pricing)
				window.StoreProducts.product[id] = {
					selected_users: devices_no,
					selected_years: years_no,
					selected_variation: {
						product_id: id,
						region_id: 22,
						variation_id: 0,
						platform_id: 16,
						price: pricing.total,
						variation: {
							years: years_no
						},
						currency_label: '€',
						currency_iso: 'EUR',
						discount: {
							discounted_price: pricing.price,
							discount_value: pricing.discount,
						},
						promotion: campaignId,
					},
					buy_link: zuoraCart.href,
					config: {
						product_id: id,
						full_price_class: `oldprice-${id}`,
						discounted_price_class: `newprice-${id}`,
						price_class: `price-${id}`,
						buy_class: `buylink-${id}`,
						selected_users: devices_no,
						selected_years: years_no,
						users_class: `users_${id}_fake`,
						years_class: `years_${id}_fake`,
					}
				}

				resolve(window.StoreProducts.product[id]); 
			});
		});
	}

	static async loadProduct(id, campaign) {
		window.StoreProducts = window.StoreProducts || [];
		window.StoreProducts.product = window.StoreProducts.product || {}
		// return await this.getProductVariationsPrice(id, campaign);
		return await this.getProductVariationPrice(id, campaign);
	}
}

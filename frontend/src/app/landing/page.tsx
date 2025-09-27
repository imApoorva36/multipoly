"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    SignalIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    GlobeAltIcon,
    ShieldCheckIcon
} from "@heroicons/react/16/solid";
import Link from "next/link";

function Landing() {

    const features = [
        {
            icon: CurrencyDollarIcon,
            title: "Onchain Assets",
            description: "Own digital assets as NFTs on the blockchain with true ownership and transferability.",
            color: "text-mgreen",
            bgcolor: "bg-mgreen/20",
            border: "border-mgreen"
        },
        {
            icon: UserGroupIcon,
            title: "Multiplayer Gaming",
            description: "Play with friends in real-time rooms powered by Huddle01's decentralized video infrastructure.",
            color: "text-mblue",
            bgcolor: "bg-mblue/20",
            border: "border-mblue"
        },
        {
            icon: GlobeAltIcon,
            title: "Global Tournaments",
            description: "Compete in themed tournaments from ETHGlobal events to international championships.",
            color: "text-mpurple",
            bgcolor: "bg-mpurple/20",
            border: "border-mpurple"
        },
        {
            icon: ShieldCheckIcon,
            title: "Secure & Fair",
            description: "Verifiable random dice rolls and transparent smart contract-based gameplay mechanics.",
            color: "text-mred",
            bgcolor: "bg-mred/20",
            border: "border-mred"
        }
    ];

    return (
        <div className="w-full min-h-screen">
            {/* Hero Section */}
            <div className="relative min-h-screen flex flex-col">
                <Image
                    src="/bg.png"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute w-screen h-screen inset-0 bg-black/20" />

                {/* Navigation */}
                <nav className="relative z-10 p-2 bg-white/20 border-b-2 border-slate-900">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Image src="/logo.png" alt="Multipoly Logo" width={50} height={50} />
                            <h1 className="text-3xl font-bold text-slate-100">Multipoly</h1>
                        </div>
                        <Link href="/get-started" passHref>
                            <Button
                                variant="outline"
                                className="gap-2 bg-mgreen backdrop-blur-sm border-2 border-slate-900 rounded-none hover:bg-mblue hover:text-white hover:border-mblue transition-all duration-300"
                            >
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 flex-1 mt-40 flex items-center justify-center p-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="">

                            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
                                Welcome to Multipoly
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/get-started" passHref>
                                    <Button
                                        size="lg"
                                        className="bg-mgreen hover:bg-mgreen/80 text-white border-2 border-slate-900 rounded-none py-6 px-8 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        Start Playing Now
                                    </Button>
                                </Link>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-white/80 backdrop-blur-sm border-2 border-slate-900 rounded-none py-6 px-8 text-xl font-bold hover:bg-mblue hover:text-white hover:border-mblue transition-all duration-300"
                                >
                                    Watch Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative z-10 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-800 mb-4">
                            Why so cool about Multipoly?
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Experience the future of board gaming with blockchain technology, and learn web3 concepts while having fun.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="border-2 border-black rounded-none backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardHeader>
                                    <div className={`w-12 h-12 border-2 ${feature.border} ${feature.bgcolor} rounded-none flex items-center justify-center mb-4`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-slate-800 text-lg">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-slate-600">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Game Templates Preview */}
            <div className="relative py-20 px-6 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-800 mb-4">
                            Exciting game modes to choose from
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Play in themed worlds inspired by real events and locations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <Card className="border-2 border-black rounded-none bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-slate-800 text-xl">ETHGlobal New Delhi</CardTitle>
                                        <CardDescription className="text-slate-600 mt-2">
                                            New Delhi-themed game with local landmarks and culture
                                        </CardDescription>
                                    </div>
                                    <div className="w-5 h-5 bg-mgreen rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">✓</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Image
                                    src="/delhi.png"
                                    alt="New Delhi Theme"
                                    width={400}
                                    height={200}
                                    className="w-full h-40 object-cover border border-gray-200"
                                />
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-gray-300 rounded-none bg-gray-50 opacity-60 shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-slate-800 text-xl">ETH Online 2025</CardTitle>
                                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-none">
                                                Coming Soon
                                            </span>
                                        </div>
                                        <CardDescription className="text-slate-600 mt-2">
                                            Global-themed game with international landmarks and culture
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="w-full h-40 bg-gray-200 border border-gray-300 flex items-center justify-center">
                                    <span className="text-gray-500 font-bold">Coming Soon</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative py-20 px-6">
                <Image
                    src="/world-map.png"
                    alt="Background"
                    fill
                    style={{ objectFit: "cover", zIndex: 0, opacity: 0.3 }}
                />
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <div className="bg-white/90 backdrop-blur-sm border-2 border-black rounded-none p-12 shadow-lg">
                        <h2 className="text-4xl font-bold text-slate-800 mb-6">
                            Ready to get started?
                        </h2>
                        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                            Join players in the most innovative strategy and educational board game ever created.
                            Own, trade, and compete in the blockchain gaming revolution.
                        </p>
                        <Link href="/get-started" passHref>
                            <Button
                                size="lg"
                                className="bg-mgreen hover:bg-mgreen/80 text-white border-2 border-black rounded-none py-6 px-12 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <SignalIcon className="h-5 w-5 mr-2" />
                                Start Your Journey
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative bg-mblue text-white p-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Image src="/logo.png" alt="Multipoly Logo" width={40} height={40} />
                        <h3 className="text-2xl font-bold">Multipoly</h3>
                    </div>
                    <p className="text-slate-200 mb-4">
                        The future of blockchain educational gaming is here.
                    </p>
                    <p className="text-slate-300 text-sm">
                        © 2025 Multipoly. Built with ❤️ for the web3 community.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;

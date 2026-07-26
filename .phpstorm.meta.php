<?php

declare(strict_types=1);

namespace PHPSTORM_META;

exit('This file is not meant to be executed.');

override(
    \response(),
    type(\Illuminate\Contracts\Routing\ResponseFactory::class),
);

override(
    \Illuminate\Routing\ResponseFactory::with(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Routing\ResponseFactory::status(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Routing\ResponseFactory::refresh(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Routing\ResponseFactory::replace(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Routing\ResponseFactory::remove(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Routing\ResponseFactory::append(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Routing\ResponseFactory::prepend(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Routing\ResponseFactory::navigate(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Contracts\Routing\ResponseFactory::with(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Contracts\Routing\ResponseFactory::status(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Contracts\Routing\ResponseFactory::refresh(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Contracts\Routing\ResponseFactory::replace(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Contracts\Routing\ResponseFactory::remove(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Contracts\Routing\ResponseFactory::append(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Contracts\Routing\ResponseFactory::prepend(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);

override(
    \Illuminate\Contracts\Routing\ResponseFactory::navigate(0),
    type(\Ivanfuhr\BladeX\BladeXResponseBuilder::class),
);
